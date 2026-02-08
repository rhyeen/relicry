import { Art } from '@/entities/Art';
import { getCardDocId, VersionedCard } from '@/entities/Card';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import CardPreviewItem from '@/components/CardPreviewItem';
import { getArt } from '@/server/cache/art.cache';
import { CardDB } from '@/server/db/card.db';
import { cacheLife, cacheTag, updateTag } from 'next/cache';
import DSButton from '@/components/ds/DSButton';
import DSSection from '@/components/ds/DSSection';
import { Suspense } from 'react';
import { connection } from 'next/server';

async function getCards(): Promise<VersionedCard[]> {
  'use cache';
  const index = 0;
  cacheLife('expectedChangeLowConsequenceIfStale');
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(`cards:list:${index}`);

  const { entities } = await new CardDB(firestoreAdmin).getAllFeatured(index);
  // @NOTE: This is likely either due to a bug or emulated local environment is not populated yet.
  if (!entities.length) {
    updateTag(`cards:list:${index}`);
  }
  return entities;
}

async function getCardPreviews(): Promise<{ card: VersionedCard; art: Art | null }[]> {
  const cards = await getCards();
  const previews = await Promise.all(
    cards.map(async (card) => {
      const art = card.illustration?.artId ? await getArt(card.illustration.artId) : null;
      return { card, art };
    })
  );
  return previews;
}

export function generateMetadata() {
  return {
    title: 'Cards • Relicry',
    description: 'Cards overview.',
  };
}

export default async function CardsPage() {
return (
    <DSSection>
      <h1>Cards</h1>
      <DSButton href="/cards/new" label="New Card" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        <Suspense fallback={<div>Loading card data...</div>}>
          <CardsPageData />
        </Suspense>
      </div>
    </DSSection>
  );
}

async function CardsPageData() {
  await connection();
  const previews = await getCardPreviews();

  return previews.map(({ card, art }) => (
    <CardPreviewItem
      key={`${card.id}_v${card.version}`}
      card={card}
      art={art}
      href={`/${getCardDocId(card.id, card.version)}`}
    />
  ));
}

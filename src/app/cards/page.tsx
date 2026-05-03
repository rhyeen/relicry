import { Art } from '@/entities/Art';
import { getCardDocId, VersionedCard } from '@/entities/Card';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import {
  buildCardsQueryString,
  CardListAspectFilter,
  CardListTypeFilter,
  filterAndPaginateCards,
  parseCardsFilters,
} from '@/lib/cardsList';
import CardPreviewItem from '@/components/CardPreviewItem';
import { getArt } from '@/server/cache/art.cache';
import { CardDB } from '@/server/db/card.db';
import { cacheLife, cacheTag } from 'next/cache';
import DSButton from '@/components/ds/DSButton';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { Aspect } from '@/entities/Aspect';
import { Suspense } from 'react';
import CardsToolbarClient from './CardsToolbar';
import styles from './page.module.css';

async function getCards(): Promise<VersionedCard[]> {
  'use cache';
  const index = 0;
  cacheLife('expectedChangeLowConsequenceIfStale');
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(`cards:list:${index}`);

  const { entities } = await new CardDB(getFirestoreAdmin()).getAllFeatured(index);
  return entities;
}

async function getCardPreviews(cards: VersionedCard[]): Promise<{ card: VersionedCard; art: Art | null }[]> {
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

type CardsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CardsPage({ searchParams }: CardsPageProps) {
  return (
    <DSSection>
      <div className={styles.page}>
        <DSText.Heading as="h1">Cards</DSText.Heading>
        <DSButton href="/cards/new" label="New Card" />
      </div>
      <Suspense fallback={<div>Loading filters...</div>}>
        <CardsToolbar searchParams={searchParams} />
      </Suspense>
      <div className={styles.grid}>
        <Suspense fallback={<div>Loading card data...</div>}>
          <CardsPageData searchParams={searchParams} />
        </Suspense>
      </div>
    </DSSection>
   );
}

async function CardsToolbar({ searchParams }: CardsPageProps) {
  const filters = parseCardsFilters(await searchParams);

  return (
    <CardsToolbarClient
      filters={filters}
      typeOptions={CARD_TYPE_OPTIONS}
      aspectOptions={CARD_ASPECT_OPTIONS}
    />
  );
}

async function CardsPageData({ searchParams }: CardsPageProps) {
  const [cards, resolvedSearchParams] = await Promise.all([getCards(), searchParams]);
  const filters = parseCardsFilters(resolvedSearchParams);
  const result = filterAndPaginateCards(cards, filters);
  const previews = await getCardPreviews(result.cards);
  const baseFilters = {
    query: filters.query,
    type: filters.type,
    aspect: filters.aspect,
  };

  if (result.totalCards === 0) {
    return (
      <div style={{ display: 'grid', gap: '12px' }}>
        <DSText.Body tone="muted">No cards matched the current filters.</DSText.Body>
      </div>
    );
  }

  return (
    <>
      <div className={styles.summary}>
        <DSText.Caption style={{ margin: 0 }}>
          Showing {previews.length} of {result.totalCards} featured cards
        </DSText.Caption>
        <DSText.Caption style={{ margin: 0 }}>
          Page {result.page} of {result.totalPages}
        </DSText.Caption>
      </div>
      {previews.map(({ card, art }) => (
        <CardPreviewItem
          key={`${card.id}_v${card.version}`}
          card={card}
          art={art}
          href={`/${getCardDocId(card.id, card.version)}`}
        />
      ))}
      <div className={styles.pagination}>
        <DSButton
          href={`/cards${buildCardsQueryString({ ...baseFilters, page: Math.max(1, result.page - 1) })}`}
          label="Previous"
          disabled={result.page <= 1}
        />
        <DSButton
          href={`/cards${buildCardsQueryString({ ...baseFilters, page: result.page + 1 })}`}
          label="Next"
          disabled={result.page >= result.totalPages}
        />
      </div>
    </>
  );
}

const CARD_TYPE_OPTIONS: { label: string; value: CardListTypeFilter }[] = [
  { label: 'All cards', value: 'all' },
  { label: 'Deck', value: 'deck' },
  { label: 'Focus', value: 'focus' },
  { label: 'Gambit', value: 'gambit' },
];

const CARD_ASPECT_OPTIONS: { label: string; value: CardListAspectFilter }[] = [
  { label: 'All focuses', value: 'all' },
  { label: 'Brave', value: Aspect.Brave },
  { label: 'Cunning', value: Aspect.Cunning },
  { label: 'Wise', value: Aspect.Wise },
  { label: 'Charming', value: Aspect.Charming },
  { label: 'Two focuses', value: 'dual' },
];

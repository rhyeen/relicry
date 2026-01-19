import { getCardDocId, VersionedCard } from '@/entities/Card';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { CardDB } from '@/server/db/card.db';
import { cacheLife, cacheTag, updateTag } from 'next/cache';
import Link from 'next/link';

async function getCards(): Promise<VersionedCard[]> {
  'use cache';
  const index = 0;
  cacheLife('hours');
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(`cards:list:${index}`);

  const { entities } = await new CardDB(firestoreAdmin).getAllFeatured(index);
  // @NOTE: This is likely either due to a bug or emulated local environment is not populated yet.
  if (!entities.length) {
    updateTag(`cards:list:${index}`);
  }
  return entities;
}

export function generateMetadata() {
  return {
    title: 'Cards • Relicry',
    description: 'Cards overview.',
  };
}

export default async function CardsPage() {
  const cards = await getCards();

  return (
    <div>
      <h1>Player Cards</h1>
      <ul>
        {cards.map((card) => (
          <li key={`${card.id}_v${card.version}`}>
            <Link href={`/${getCardDocId(card.id, card.version)}`}>Card ID: {card.id}, Version: {card.version}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

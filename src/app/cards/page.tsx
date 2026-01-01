import { VersionedCard } from '@/entities/Card';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { CardDB } from '@/server/db/card.db';
import { cacheLife, cacheTag, updateTag } from 'next/cache';

async function getCards(): Promise<VersionedCard[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag('cards:list');

  const cards = await new CardDB(firestoreAdmin).getBy(
    [],
    { field: 'revealedAt', direction: 'desc' },
    100,
  );

  // @NOTE: This is likely either due to a bug or emulated local environment is not populated yet.
  if (!cards) {
    updateTag('cards:list');
  }
  return cards;
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
            Card ID: {card.id}, Version: {card.version}
          </li>
        ))}
      </ul>
    </div>
  );
}

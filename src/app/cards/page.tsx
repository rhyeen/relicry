import { VersionedCard } from '@/entities/Card';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { CardDB } from '@/server/db/card.db';
import { cache } from 'react';

const getCards = cache(async (): Promise<VersionedCard[]> => {
  return new CardDB(firestoreAdmin).getBy([], [{ field: 'revealedAt', direction: 'desc' }], 100);
});

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
      <p>Welcome to the Player Cards page.</p>
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
import { PlayerCard } from '@/entities/PlayerCard';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { PlayerCardDB } from '@/server/db/playerCard.db';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Params = { user_id: string };

const getPlayerCards = cache(async (user_id: string): Promise<PlayerCard[]> => {
  return new PlayerCardDB(firestoreAdmin).getByUserId(user_id);
});

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { user_id } = await params;
  const playerCards = await getPlayerCards(user_id);

  if (!playerCards || playerCards.length === 0) {
    return {
      title: 'Player Card Not Found',
      description: 'The requested player card does not exist.',
    };
  }

  return {
    title: `Cards • ${user_id} • Relicry`,
    description: `Player card for user ${user_id}.`,
  };
}

export default async function PlayerCardPage(
  { params }: { params: Promise<Params> }
) {
  const { user_id } = await params;
  const playerCards = await getPlayerCards(user_id);

  if (!playerCards) notFound();

  return (
    <div>
      <h1>Player Cards</h1>
      <p>User ID: {user_id}</p>
      <ul>
        {playerCards.map((card) => (
          <li key={`${card.cardId}_v${card.cardVersion}`}>
            Card ID: {card.cardId}, Version: {card.cardVersion}
          </li>
        ))}
      </ul>
    </div>
  );
}
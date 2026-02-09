import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getPlayerCards } from '@/server/cache/playerCard.cache';
import { connection } from 'next/server';

type Params = { user_id: string };

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
  return (
    <div>
      <h1>Player Cards</h1>
      <Suspense fallback={<div>Loading player cards...</div>}>
        <PlayerCardPageData params={params} />
      </Suspense>
    </div>
  );
}

async function PlayerCardPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { user_id } = await params;
  const playerCards = await getPlayerCards(user_id);

  if (!playerCards) notFound();

  return (
    <div>
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

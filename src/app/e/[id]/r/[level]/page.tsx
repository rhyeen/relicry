import { Reward } from '@/entities/Reward';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { RewardDB } from '@/server/db/reward.db';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Params = { id: string, level: string };

const getReward = cache(async (id: string, level: string): Promise<Reward | null> => {
  return new RewardDB(firestoreAdmin).getFromParts(id, parseInt(level, 10));
});

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id, level } = await params;
  const reward = await getReward(id, level);

  if (!reward) {
    return {
      title: 'Reward Not Found',
      description: 'The requested reward does not exist.',
    };
  }

  return {
    title: `${reward.level} • Relicry`,
    description: `Details for the reward ${reward.level}.`,
  };
}

export default async function RewardPage(
  { params }: { params: Promise<Params> }
) {
  const { id, level } = await params;
  const reward = await getReward(id, level);

  if (!reward) notFound();

  return (
    <div>
      <h1>Reward for {reward.eventId}</h1>
      <p>Level: {level}</p>
    </div>
  );
}
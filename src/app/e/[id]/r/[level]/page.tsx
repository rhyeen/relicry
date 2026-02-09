import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getReward } from '@/server/cache/reward.cache';
import { connection } from 'next/server';

type Params = { id: string, level: string };

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
  return (
    <div>
      <h1>Reward Details</h1>
      <Suspense fallback={<div>Loading reward data...</div>}>
        <RewardPageData params={params} />
      </Suspense>
    </div>
  );
}

async function RewardPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
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

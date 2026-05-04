import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getReward } from '@/server/cache/reward.cache';
import { connection } from 'next/server';
import { normalizeSizeSP, normalizeSideSP } from '@/lib/normalizeSearchParams';
import FullRewardCard from '@/components/quest/FullRewardCard';
import { CardType } from '@/entities/CardContext';
import { getEvent } from '@/server/cache/event.cache';
import DSText from '@/components/ds/DSText';
import RewardUniqueRewardsManagerSlot from '@/components/client/RewardUniqueRewardsManager.slot';
import { getUniqueRewards } from '@/server/cache/uniqueReward.cache';

type Params = { id: string, level: string };
type SearchParams = { size?: string | string[]; side?: string | string[] };

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
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  return (
    <div>
      <DSText.Heading as="h1">Reward Details</DSText.Heading>
      <Suspense fallback={<div>Loading reward data...</div>}>
        <RewardPageData params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function RewardPageData(
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  await connection();
  const [{ id, level }, sp] = await Promise.all([params, searchParams]);
  const size = normalizeSizeSP(sp);
  const side = normalizeSideSP(sp);
  const [ reward, event, uniqueRewards ] = await Promise.all([
    getReward(id, level),
    getEvent(id),
    getUniqueRewards(id, level),
  ]);

  if (!reward) notFound();
  if (!event) notFound();

  return (
    <section style={{ display: 'grid', gap: '1.5rem' }}>
      <FullRewardCard event={event} reward={reward} side={side} ctx={{
        type: CardType.Full,
        size,
      }} />
      <RewardUniqueRewardsManagerSlot
        eventId={event.id}
        level={reward.level}
        uniqueRewards={uniqueRewards}
      />
    </section>
  );
}

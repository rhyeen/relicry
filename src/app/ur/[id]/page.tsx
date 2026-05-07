import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { connection } from 'next/server';
import DSText from '@/components/ds/DSText';
import cardStyles from '@/components/card/Card.module.css';
import FullRewardCard from '@/components/quest/FullRewardCard';
import { CardSize, CardType } from '@/entities/CardContext';
import { getEvent } from '@/server/cache/event.cache';
import { getReward } from '@/server/cache/reward.cache';
import { getUniqueReward } from '@/server/cache/uniqueReward.cache';
import { normalizeSideSP, normalizeSizeSP } from '@/lib/normalizeSearchParams';

type Params = { id: string };
type SearchParams = { size?: string | string[]; side?: string | string[] };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const uniqueReward = await getUniqueReward(id);

  if (!uniqueReward) {
    return {
      title: 'Unique Reward Not Found',
      description: 'The requested unique reward does not exist.',
    };
  }

  return {
    title: `${uniqueReward.id} • Relicry`,
    description: `Printed reward for level ${uniqueReward.level}.`,
  };
}

export default function UniqueRewardPage(
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  return (
    <Suspense fallback={null}>
      <UniqueRewardPageData params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function UniqueRewardPageData(
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  await connection();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const size = normalizeSizeSP(sp);
  const side = normalizeSideSP(sp);
  const isPrintSize = size === CardSize.PrintSize;
  const uniqueReward = await getUniqueReward(id);

  if (!uniqueReward) notFound();

  const [reward, event] = await Promise.all([
    getReward(uniqueReward.eventId, uniqueReward.level),
    getEvent(uniqueReward.eventId),
  ]);

  if (!reward || !event) notFound();

  return (
    <div>
      {!isPrintSize && <DSText.Heading as="h1">Printed Reward</DSText.Heading>}
      <div
        className={[
          cardStyles.cardContainer,
          isPrintSize ? cardStyles.printSize : '',
          isPrintSize ? cardStyles.printSizeEdgeToEdge : '',
        ].filter(Boolean).join(' ')}
      >
        <FullRewardCard
          event={event}
          reward={reward}
          side={side}
          uniqueReward={uniqueReward}
          ctx={{
            type: CardType.Full,
            size,
          }}
        />
      </div>
    </div>
  );
}

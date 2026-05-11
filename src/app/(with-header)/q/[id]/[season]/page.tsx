import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getQuest } from '@/server/cache/quest.cache';
import { connection } from 'next/server';
import FullQuestCard from '@/components/quest/FullQuestCard';
import { normalizeSideSP, normalizeSizeSP } from '@/lib/normalizeSearchParams';
import { CardSize, CardType } from '@/entities/CardContext';
import DSText from '@/components/ds/DSText';
import cardStyles from '@/components/card/Card.module.css';

type Params = { id: string, season: string };
type SearchParams = { size?: string | string[]; side?: string | string[] };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id, season } = await params;
  const quest = await getQuest(id);

  if (!quest) {
    return {
      title: 'Quest Not Found',
      description: 'The requested quest does not exist.',
    };
  }

  return {
    title: `${quest.faction} • Relicry`,
    description: `Level ${quest.level} • Season ${season}`,
  };
}

export default async function QuestPage(
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  return (
    <Suspense fallback={null}>
      <QuestPageData params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function QuestPageData(
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  await connection();
  const [{ id, season }, sp] = await Promise.all([params, searchParams]);
  const size = normalizeSizeSP(sp);
  const side = normalizeSideSP(sp);
  const isPrintSize = size === CardSize.PrintSize;
  const quest = await getQuest(id, season);

  if (!quest) notFound();

  return (
    <div>
      {!isPrintSize && <DSText.Heading as="h1">Quest Details</DSText.Heading>}
      <div
        className={[
          cardStyles.cardContainer,
          isPrintSize ? cardStyles.printSize : '',
          isPrintSize ? cardStyles.printSizeEdgeToEdge : '',
        ].filter(Boolean).join(' ')}
      >
        <FullQuestCard quest={quest} side={side} ctx={{
          type: CardType.Full,
          size,
        }} />
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getQuest } from '@/server/cache/quest.cache';
import { connection } from 'next/server';
import FullQuestCard from '@/components/quest/FullQuestCard';
import { normalizeSideSP, normalizeSizeSP } from '@/lib/normalizeSearchParams';
import { CardType } from '@/entities/CardContext';

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
    <div>
      <h1>Quest Details</h1>
      <Suspense fallback={<div>Loading quest data...</div>}>
        <QuestPageData params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function QuestPageData(
  { params, searchParams }: { params: Promise<Params>; searchParams?: Promise<SearchParams> }
) {
  await connection();
  const [{ id, season }, sp] = await Promise.all([params, searchParams]);
  const size = normalizeSizeSP(sp);
  const side = normalizeSideSP(sp);
  const quest = await getQuest(id, season);

  if (!quest) notFound();

  return (
    <section>
      <FullQuestCard quest={quest} side={side} ctx={{
        type: CardType.Full,
        size,
      }} />
    </section>
  );
}

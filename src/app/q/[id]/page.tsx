import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getQuest } from '@/server/cache/quest.cache';
import { connection } from 'next/server';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const quest = await getQuest(id);

  if (!quest) {
    return {
      title: 'Quest Not Found',
      description: 'The requested quest does not exist.',
    };
  }

  return {
    title: `${quest.faction} • Relicry`,
    description: quest.level,
  };
}

export default async function QuestPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <div>
      <h1>Quest Details</h1>
      <Suspense fallback={<div>Loading quest data...</div>}>
        <QuestPageData params={params} />
      </Suspense>
    </div>
  );
}

async function QuestPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const quest = await getQuest(id);

  if (!quest) notFound();

  return (
    <div>
      <h1>{quest.faction}</h1>
      <p>ID: {quest.id}</p>
      <p>Level: {quest.level}</p>
    </div>
  );
}

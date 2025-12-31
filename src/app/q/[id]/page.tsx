import { Quest } from '@/entities/Quest';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { QuestDB } from '@/server/db/quest.db';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Params = { id: string };

const getQuest = cache(async (id: string): Promise<Quest | null> => {
  return new QuestDB(firestoreAdmin).getLatest(id);
});

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
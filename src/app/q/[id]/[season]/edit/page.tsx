import notFound from '@/app/not-found';
import EditQuestSlot from '@/components/client/EditQuest.slot';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { QuestDB } from '@/server/db/quest.db';
import { QuestTokenDB } from '@/server/db/questToken.db';
import { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';

type Params = { id: string; season: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { id, season } = await params;
  const seasonNumber = Number.parseInt(season, 10);
  if (!Number.isInteger(seasonNumber) || seasonNumber < 1) {
    return {
      title: 'Quest Not Found',
      description: 'The requested quest does not exist.',
    };
  }
  const quest = await new QuestDB(getFirestoreAdmin()).getFromParts(id, seasonNumber);

  if (!quest) {
    return {
      title: 'Quest Not Found',
      description: 'The requested quest does not exist.',
    };
  }

  return {
    title: `Edit ${quest.id} • Relicry`,
    description: `Edit quest ${quest.id} (season ${quest.season})`,
  };
}

export default async function EditQuestAdminPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <Suspense fallback={<div>Loading quest data...</div>}>
      <EditQuestAdminPageData params={params} />
    </Suspense>
  );
}

async function EditQuestAdminPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id, season } = await params;
  const seasonNumber = Number.parseInt(season, 10);
  if (!Number.isInteger(seasonNumber) || seasonNumber < 1) {
    notFound();
    return;
  }
  const firestoreAdmin = getFirestoreAdmin();
  const quest = await new QuestDB(firestoreAdmin).getFromParts(id, seasonNumber);
  if (!quest) {
    notFound();
    return;
  }
  const questTokens = await new QuestTokenDB(firestoreAdmin).getQuestTokens(id, seasonNumber);
  return <EditQuestSlot quest={quest} questTokens={questTokens} />;
}

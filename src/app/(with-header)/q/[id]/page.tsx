import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

type Params = { id: string };

export default async function QuestPage(
  { params }: { params: Promise<Params>; }
) {
  return (
    <Suspense fallback={null}>
      <QuestPageData params={params} />
    </Suspense>
  );
}

async function QuestPageData(
  { params }: { params: Promise<Params>; }
) {
  await connection();
  const { id } = await params;
  return redirect(`/q/${id}/1`);
}

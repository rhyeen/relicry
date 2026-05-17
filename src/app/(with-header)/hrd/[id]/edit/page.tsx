import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import EditHeraldSlot from '@/components/client/EditHerald.slot';
import DSPage from '@/components/ds/DSPage';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { HeraldDB } from '@/server/db/herald.db';
import { getHeraldView } from '@/server/heralds';
import { connection } from 'next/server';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const view = await getHeraldView(id);

  if (!view) {
    return {
      title: 'Herald Not Found',
      description: 'The requested herald does not exist.',
    };
  }

  return {
    title: `Edit ${view.displayName} • Relicry`,
    description: `Edit herald ${view.displayName}.`,
  };
}

export default function EditHeraldPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <DSPage>
      <Suspense fallback={<div>Loading herald data...</div>}>
        <EditHeraldPageData params={params} />
      </Suspense>
    </DSPage>
  );
}

async function EditHeraldPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const herald = await new HeraldDB(getFirestoreAdmin()).getFromParts(id);

  if (!herald) {
    notFound();
  }

  return <EditHeraldSlot herald={herald} />;
}

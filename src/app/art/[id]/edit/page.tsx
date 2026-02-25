import notFound from '@/app/not-found';
import EditArtSlot from '@/components/client/EditArt.slot';
import { getArt } from '@/server/cache/art.cache';
import { connection } from 'next/server';
import { Suspense } from 'react';

type Params = { id: string; season: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const art = await getArt(id);

  if (!art) {
    return {
      title: 'Art Not Found',
      description: 'The requested art does not exist.',
    };
  }

  return {
    title: `${art.title ?? 'Untitled Art'} • Relicry`,
    description: art.description ?? 'Details for the requested art.',
  };
}

export default async function EditArtPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <div>
      <h1>Edit Art</h1>
      <Suspense fallback={<div>Loading art data...</div>}>
        <EditArtPageData params={params} />
      </Suspense>
    </div>
  );
}

async function EditArtPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const art = await getArt(id);
  if (!art) {
    notFound();
    return;
  }

  return (
    <EditArtSlot art={art} />
  );
}
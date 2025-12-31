import { Art } from '@/entities/Art';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { ArtDB } from '@/server/db/art.db';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Params = { id: string };

const getArt = cache(async (id: string): Promise<Art | null> => {
  return new ArtDB(firestoreAdmin).getFromParts(id);
});

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

export default async function ArtPage(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const art = await getArt(id);

  if (!art) notFound();

  return (
    <div>
      <h1>{art.title ?? 'Untitled Art'}</h1>
      <p>ID: {art.id}</p>
      <p>Type: {art.type}</p>
      <p>Description: {art.description}</p>
    </div>
  );
}
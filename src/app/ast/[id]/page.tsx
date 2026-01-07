import { Artist } from '@/entities/Artist';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { ArtistDB } from '@/server/db/artist.db';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Params = { id: string };

const getArtist = cache(async (id: string): Promise<Artist | null> => {
  return new ArtistDB(firestoreAdmin).getFromParts(id);
});

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const artist = await getArtist(id);

  if (!artist) {
    return {
      title: 'Artist Not Found',
      description: 'The requested artist does not exist.',
    };
  }

  return {
    title: `${artist.name} • Relicry`,
    description: artist.description ?? 'Details for the requested artist.',
  };
}

export default async function ArtistPage(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const artist = await getArtist(id);
  if (!artist) notFound();

  return (
    <div>
      <h1>{artist.name}</h1>
      <p>ID: {artist.id}</p>
    </div>
  );
}
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getArtist } from '@/server/cache/artist.cache';
import { connection } from 'next/server';
import DSText from '@/components/ds/DSText';

type Params = { id: string };

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
  return (
    <div>
      <DSText.Heading as="h1">Artist Details</DSText.Heading>
      <Suspense fallback={<div>Loading artist data...</div>}>
        <ArtistPageData params={params} />
      </Suspense>
    </div>
  );
}

async function ArtistPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const artist = await getArtist(id);
  if (!artist) notFound();

  return (
    <div>
      <DSText.Heading as="h2">{artist.name}</DSText.Heading>
      <DSText.Body tone="muted">ID: {artist.id}</DSText.Body>
    </div>
  );
}

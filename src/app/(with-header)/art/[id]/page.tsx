import ArtDetail from '@/components/art/ArtDetail';
import DSPage from '@/components/ds/DSPage';
import { getArt } from '@/server/cache/art.cache';
import { getArtist } from '@/server/cache/artist.cache';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

type Params = { id: string };

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
  return (
    <DSPage>
      <DSPage.Back href="/art" label="Back to Gallery" />
      <Suspense fallback={<div>Loading art data...</div>}>
        <ArtPageData params={params} />
      </Suspense>
    </DSPage>
  );
}

async function ArtPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const art = await getArt(id);
  if (!art) notFound();
  const artist = art.artistId ? await getArtist(art.artistId) : null;

  return <ArtDetail art={art} artist={artist} />;
}

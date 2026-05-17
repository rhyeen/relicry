import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import EditArtistSlot from '@/components/client/EditArtist.slot';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { getArtist } from '@/server/cache/artist.cache';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const artist = await getArtist(id);

  return {
    title: artist ? `Edit ${artist.name} • Relicry` : 'Edit Artist • Relicry',
    description: 'Edit an artist in Relicry.',
  };
}

export default async function EditArtistAdminPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <DSPage removeTopPadding>
      <Suspense fallback={<EditArtistLoading />}>
        <EditArtistData params={params} />
      </Suspense>
    </DSPage>
  );
}

function EditArtistLoading() {
  return (
    <DSSection.Card background="darkBrown" width="form">
      <DSText.Body tone="muted">Loading artist editor...</DSText.Body>
    </DSSection.Card>
  );
}

async function EditArtistData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const artist = await getArtist(id);
  if (!artist) notFound();

  return (
    <>
      <DSPage.Back href={`/${artist.id}`} label="Back to artist" />
      <EditArtistSlot artist={artist} />
    </>
  );
}

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getEventMap } from '@/server/cache/eventMap.cache';
import { connection } from 'next/server';
import DSText from '@/components/ds/DSText';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const map = await getEventMap(id);

  if (!map) {
    return {
      title: 'Map Not Found',
      description: 'The requested map does not exist.',
    };
  }

  return {
    title: `${map.id} • Relicry`,
    description: `Details for the map ${map.id}.`,
  };
}

export default async function MapPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <div>
      <DSText.Heading as="h1">Map Details</DSText.Heading>
      <Suspense fallback={<div>Loading map data...</div>}>
        <MapPageData params={params} />
      </Suspense>
    </div>
  );
}

async function MapPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const map = await getEventMap(id);

  if (!map) notFound();

  return (
    <div>
      <DSText.Body tone="muted">ID: {map.id}</DSText.Body>
      <DSText.Body tone="muted">Event: {map.eventId}</DSText.Body>
    </div>
  );
}

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getEventMap } from '@/server/cache/eventMap.cache';
import { connection } from 'next/server';

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
      <h1>Map Details</h1>
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
      <p>ID: {map.id}</p>
      <p>Event: {map.eventId}</p>
    </div>
  );
}

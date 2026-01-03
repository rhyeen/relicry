import { EventMap } from '@/entities/EventMap';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { EventMapDB } from '@/server/db/eventMap.db';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Params = { id: string };

const getMap = cache(async (id: string): Promise<EventMap | null> => {
  return new EventMapDB(firestoreAdmin).getFromParts(id);
});

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const map = await getMap(id);

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
  const { id } = await params;
  const map = await getMap(id);

  if (!map) notFound();

  return (
    <div>
      <p>ID: {map.id}</p>
      <p>Event: {map.eventId}</p>
    </div>
  );
}
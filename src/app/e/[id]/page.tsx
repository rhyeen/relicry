import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { Event } from '@/entities/Event';
import { EventDB } from '@/server/db/event.db';

type Params = { id: string };

const getEvent = cache(async (id: string): Promise<Event | null> => {
  return new EventDB(firestoreAdmin).getFromParts(id);
});

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event does not exist.',
    };
  }

  return {
    title: `${event.title} • Relicry`,
    description: event.description,
  };
}

export default async function EventPage(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) notFound();

  return (
    <div>
      <h1>{event.title}</h1>
      <p>ID: {event.id}</p>
      <p>Description: {event.description}</p>
      <p>
        Running From: {event.running.from.toDateString()} To:{' '}
        {event.running.to.toDateString()}
      </p>
    </div>
  );
}
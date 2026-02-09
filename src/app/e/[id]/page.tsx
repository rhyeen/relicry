import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getEvent } from '@/server/cache/event.cache';
import { connection } from 'next/server';

type Params = { id: string };

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
  return (
    <div>
      <h1>Event Details</h1>
      <Suspense fallback={<div>Loading event data...</div>}>
        <EventPageData params={params} />
      </Suspense>
    </div>
  );
}

async function EventPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
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

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getEvent } from '@/server/cache/event.cache';
import { connection } from 'next/server';
import DSText from '@/components/ds/DSText';

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
      <DSText.Heading as="h1">Event Details</DSText.Heading>
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
      <DSText.Heading as="h2">{event.title}</DSText.Heading>
      <DSText.Body tone="muted">ID: {event.id}</DSText.Body>
      <DSText.Body tone="muted">Description: {event.description}</DSText.Body>
      <DSText.Body tone="muted">
        Running From: {event.running.from.toDateString()} To:{' '}
        {event.running.to.toDateString()}
      </DSText.Body>
    </div>
  );
}

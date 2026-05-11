import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getEvent } from '@/server/cache/event.cache';
import { connection } from 'next/server';
import DSText from '@/components/ds/DSText';
import DSButton from '@/components/ds/DSButton';
import DSSection from '@/components/ds/DSSection';
import { RewardDB } from '@/server/db/reward.db';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import Link from 'next/link';

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
    <DSSection>
      <DSText.Heading as="h1">Event Details</DSText.Heading>
      <Suspense fallback={<div>Loading event data...</div>}>
        <EventPageData params={params} />
      </Suspense>
    </DSSection>
  );
}

async function EventPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) notFound();

  const rewards = await new RewardDB(getFirestoreAdmin()).getBy({
    where: [{ field: 'eventId', op: '==', value: event.id }],
    sortBy: { field: 'level', direction: 'asc' },
  });
  const activeRewards = rewards.filter((reward) => reward.archivedAt === null);

  return (
    <div>
      <DSText.Heading as="h2">{event.title}</DSText.Heading>
      <DSButton href={`/${event.id}/edit`} label="Edit Event" />
      <DSButton href={`/${event.id}/starter-deck-scan`} label="Starter Deck Scan" />
      <DSText.Body tone="muted">ID: {event.id}</DSText.Body>
      <DSText.Body tone="muted">Description: {event.description}</DSText.Body>
      <DSText.Body tone="muted">
        Running From: {event.running.from.toDateString()} To:{' '}
        {event.running.to.toDateString()}
      </DSText.Body>
      <DSText.Heading as="h3">Rewards</DSText.Heading>
      {activeRewards.length === 0 ? (
        <DSText.Body tone="muted">No rewards are configured for this event.</DSText.Body>
      ) : (
        <div>
          {activeRewards.map((reward) => (
            <div key={`${reward.eventId}-${reward.level}`}>
              <Link href={`/${event.id}/r/${reward.level}`}>
                Reward Level {reward.level}
              </Link>
              <DSText.Caption>
                Quest: {reward.questId ?? 'None'} • Scene: {reward.sceneId ?? 'None'}
              </DSText.Caption>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

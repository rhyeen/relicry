import DSButton from '@/components/ds/DSButton';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import AdminPageAction from '@/components/client/AdminPageAction';
import { AdminRole } from '@/entities/AdminRole';
import { Event } from '@/entities/Event';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { getEvents } from '@/server/cache/event.cache';

export function generateMetadata() {
  return {
    title: 'Events • Relicry',
    description: 'Events running from now onward.',
  };
}

export default async function EventsPage() {
  return (
    <DSPage>
      <DSSection.Card background="darkBrown" padding="thick">
        <DSSection.Heading>
          <DSText.Eyebrow>Gatherings</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl">Events</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body size="lg" tone="muted">
            Find upcoming Relicry events, join a local adventure, and keep track of the quests and
            rewards available at each gathering.
          </DSText.Body>
        </DSSection.Text>
        <AdminPageAction href="/events/new" label="New Event" requiredRole={AdminRole.EventAdmin} />
      </DSSection.Card>

      <Suspense fallback={<EventsLoading />}>
        <EventsPageData />
      </Suspense>
    </DSPage>
  );
}

function EventsLoading() {
  return (
    <DSSection.Card>
      <DSText.Body tone="muted">Loading events...</DSText.Body>
    </DSSection.Card>
  );
}

async function EventsPageData() {
  await connection();
  const now = new Date();
  const events = await getEvents();
  const visibleEvents = events.filter((event) => event.archivedAt === null && event.running.from >= now);

  if (visibleEvents.length === 0) {
    return (
      <DSSection.Card>
        <DSText.Body tone="muted">No upcoming events are scheduled yet.</DSText.Body>
      </DSSection.Card>
    );
  }

  return (
    <DSSection>
      {visibleEvents.map((event) => (
        <EventListItem key={event.id} event={event} />
      ))}
    </DSSection>
  );
}

function EventListItem({ event }: { event: Event }) {
  return (
    <DSSection.Card>
      <DSSection.Heading>
        <DSText.Heading as="h2" size="xl">
          {event.title}
        </DSText.Heading>
        <DSText.Caption>
          {formatEventDate(event.running.from)} to {formatEventDate(event.running.to)}
        </DSText.Caption>
      </DSSection.Heading>
      <DSSection.Text>
        <DSText.Body tone="muted">{event.description}</DSText.Body>
      </DSSection.Text>
      <DSSection.Actions>
        <DSButton href={`/${event.id}`} label="View Event" />
        <DSButton href={`/${event.id}/edit`} label="Edit Event" />
      </DSSection.Actions>
    </DSSection.Card>
  );
}

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

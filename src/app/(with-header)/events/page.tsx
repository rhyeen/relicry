import DSButton from '@/components/ds/DSButton';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { Event } from '@/entities/Event';
import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { getEvents } from '@/server/cache/event.cache';
import styles from './page.module.css';

export function generateMetadata() {
  return {
    title: 'Events • Relicry',
    description: 'Events running from now onward.',
  };
}

export default async function EventsPage() {
  return (
    <DSSection>
      <div className={styles.pageHeader}>
        <DSText.Heading as="h1">Events</DSText.Heading>
        <DSButton href="/events/new" label="New Event" />
      </div>
      <Suspense fallback={<div>Loading events...</div>}>
        <EventsPageData />
      </Suspense>
    </DSSection>
  );
}

async function EventsPageData() {
  await connection();
  const now = new Date();
  const events = await getEvents();
  const visibleEvents = events.filter((event) => event.archivedAt === null && event.running.from >= now);

  if (visibleEvents.length === 0) {
    return (
      <div className={styles.emptyState}>
        <DSText.Body tone="muted">No upcoming events are scheduled yet.</DSText.Body>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {visibleEvents.map((event) => (
        <EventListItem key={event.id} event={event} />
      ))}
    </div>
  );
}

function EventListItem({ event }: { event: Event }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <DSText.Heading as="h2" size="xl">
          <Link href={`/${event.id}`} className={styles.eventLink}>
            {event.title}
          </Link>
        </DSText.Heading>
        <DSText.Caption>
          {formatEventDate(event.running.from)} to {formatEventDate(event.running.to)}
        </DSText.Caption>
      </div>
      <DSText.Body tone="muted">{event.description}</DSText.Body>
      <div className={styles.cardActions}>
        <DSButton href={`/${event.id}`} label="View Event" />
        <DSButton href={`/${event.id}/edit`} label="Edit Event" />
      </div>
    </article>
  );
}

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

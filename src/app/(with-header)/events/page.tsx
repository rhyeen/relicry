import DSButton from '@/components/ds/DSButton';
import DSPagination from '@/components/ds/DSPagination';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import AdminPageAction from '@/components/client/AdminPageAction';
import StoredImage from '@/components/client/StoredImage';
import { AdminRole } from '@/entities/AdminRole';
import type { Event } from '@/entities/Event';
import { ImageSize } from '@/entities/Image';
import { connection } from 'next/server';
import Link from 'next/link';
import { Suspense } from 'react';
import { getOngoingAndUpcomingEvents } from '@/server/cache/event.cache';
import styles from './page.module.css';

type SearchParams = Record<string, string | string[] | undefined>;

const EVENTS_PAGE_SIZE = 6;
const LIVE_PAGE_PARAM = 'livePage';
const UPCOMING_PAGE_PARAM = 'upcomingPage';

export function generateMetadata() {
  return {
    title: 'Events • Relicry',
    description: 'Current and upcoming Relicry events.',
  };
}

export default async function EventsPage(
  { searchParams }: { searchParams?: Promise<SearchParams> }
) {
  return (
    <DSPage>
      <DSSection.Card background="darkBrown" padding="thick">
        <DSSection.Heading>
          <DSText.Eyebrow>Gatherings</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl">Events</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body size="lg" tone="muted">
            Find current and upcoming Relicry events, join a local adventure, and keep track of the
            quests and rewards available at each gathering.
          </DSText.Body>
        </DSSection.Text>
        <DSSection.Actions>
          <AdminPageAction href="/events/new" label="New Event" requiredRole={AdminRole.EventAdmin} />
        </DSSection.Actions>
      </DSSection.Card>

      <Suspense fallback={<EventsLoading />}>
        <EventsPageData searchParams={searchParams} />
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

async function EventsPageData(
  { searchParams }: { searchParams?: Promise<SearchParams> }
) {
  await connection();
  const resolvedSearchParams = await searchParams;
  const now = new Date();
  const events = await getOngoingAndUpcomingEvents(now);
  const visibleEvents = events.filter((event) => event.archivedAt === null);
  const ongoingEvents = visibleEvents
    .filter((event) => event.running.from <= now && event.running.to >= now)
    .sort(sortEventsByStartDate);
  const upcomingEvents = visibleEvents
    .filter((event) => event.running.from > now)
    .sort(sortEventsByStartDate);
  const ongoingPage = getClampedPage(
    resolvedSearchParams?.[LIVE_PAGE_PARAM],
    getTotalPages(ongoingEvents.length)
  );
  const upcomingPage = getClampedPage(
    resolvedSearchParams?.[UPCOMING_PAGE_PARAM],
    getTotalPages(upcomingEvents.length)
  );

  if (visibleEvents.length === 0) {
    return (
      <DSSection.Card>
        <DSText.Body tone="muted">No current or upcoming events are scheduled yet.</DSText.Body>
      </DSSection.Card>
    );
  }

  return (
    <>
      {ongoingEvents.length > 0 && (
        <EventGallerySection
          title="Ongoing Events"
          eyebrow="Live now"
          events={ongoingEvents}
          page={ongoingPage}
          pageParam={LIVE_PAGE_PARAM}
          searchParams={resolvedSearchParams}
          status="ongoing"
        />
      )}
      {upcomingEvents.length > 0 && (
        <EventGallerySection
          title="Upcoming Events"
          eyebrow="Coming soon"
          events={upcomingEvents}
          page={upcomingPage}
          pageParam={UPCOMING_PAGE_PARAM}
          searchParams={resolvedSearchParams}
          status="upcoming"
        />
      )}
    </>
  );
}

function EventGallerySection({
  title,
  eyebrow,
  events,
  page,
  pageParam,
  searchParams,
  status,
}: {
  title: string;
  eyebrow: string;
  events: Event[];
  page: number;
  pageParam: string;
  searchParams?: SearchParams;
  status: EventStatus;
}) {
  const totalPages = getTotalPages(events.length);
  const visibleEvents = getEventPage(events, page);

  return (
    <DSSection className={styles.eventSection}>
      <DSSection.Heading>
        <DSText.Eyebrow>{eyebrow}</DSText.Eyebrow>
        <DSText.Heading as="h2" size="xl">{title}</DSText.Heading>
      </DSSection.Heading>
      <div className={styles.eventGrid}>
        {visibleEvents.map((event) => (
          <EventGalleryCard key={event.id} event={event} status={status} />
        ))}
      </div>
      <DSPagination>
        <DSPagination.Totals
          shown={visibleEvents.length}
          total={events.length}
          label="events"
        />
        <DSPagination.PageIndex page={page} totalPages={totalPages} />
        <DSPagination.LinkActions
          previousHref={buildEventsPageHref(searchParams, pageParam, page - 1)}
          nextHref={buildEventsPageHref(searchParams, pageParam, page + 1)}
          previousDisabled={page <= 1}
          nextDisabled={page >= totalPages}
        />
      </DSPagination>
    </DSSection>
  );
}

type EventStatus = 'ongoing' | 'upcoming';

function EventGalleryCard({ event, status }: { event: Event; status: EventStatus }) {
  const image = event.image?.[ImageSize.Banner] ?? event.image?.[ImageSize.Thumb] ?? null;
  const title = event.title.trim() || 'Untitled Event';
  const description = event.description.trim();

  return (
    <article className={styles.eventCard} data-status={status}>
      <Link
        href={`/${event.id}`}
        className={styles.eventCardLink}
        aria-label={`View event: ${title}`}
      />
      <div className={styles.eventMedia}>
        {image ? (
          <StoredImage
            image={image}
            size={ImageSize.Banner}
            alt={title}
            className={styles.eventImage}
          />
        ) : (
          <div className={styles.eventImageFallback} aria-hidden="true">
            <span>{getEventInitials(title)}</span>
          </div>
        )}
        <span className={styles.statusBadge}>{status === 'ongoing' ? 'Ongoing' : 'Upcoming'}</span>
      </div>
      <div className={styles.eventContent}>
        <DSText.Caption className={styles.eventDate}>
          {formatEventDateRange(event.running.from, event.running.to)}
        </DSText.Caption>
        <DSText.Heading as="h3" size="lg" className={styles.eventTitle}>
          {title}
        </DSText.Heading>
        <DSText.Body tone="muted" className={styles.eventDescription}>
          {description}
        </DSText.Body>
      </div>
      <div className={styles.eventActions}>
        <DSSection.Actions>
          <DSButton href={`/${event.id}`} label="View Event" />
          <AdminPageAction href={`/${event.id}/edit`} label="Edit Event" requiredRole={AdminRole.EventAdmin} />
        </DSSection.Actions>
      </div>
    </article>
  );
}

function sortEventsByStartDate(first: Event, second: Event) {
  return first.running.from.getTime() - second.running.from.getTime();
}

function getEventPage(events: Event[], page: number) {
  const start = (page - 1) * EVENTS_PAGE_SIZE;
  return events.slice(start, start + EVENTS_PAGE_SIZE);
}

function getTotalPages(totalEvents: number) {
  return Math.max(1, Math.ceil(totalEvents / EVENTS_PAGE_SIZE));
}

function getClampedPage(value: string | string[] | undefined, totalPages: number) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(rawValue ?? '1', 10);

  if (!Number.isInteger(page)) {
    return 1;
  }

  return Math.min(Math.max(page, 1), totalPages);
}

function buildEventsPageHref(
  searchParams: SearchParams | undefined,
  pageParam: string,
  page: number
) {
  const params = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (key === pageParam || value === undefined) {
      return;
    }
    const values = Array.isArray(value) ? value : [value];
    values.forEach((paramValue) => {
      params.append(key, paramValue);
    });
  });

  if (page > 1) {
    params.set(pageParam, String(page));
  }

  const queryString = params.toString();
  return queryString ? `/events?${queryString}` : '/events';
}

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatEventDateRange(from: Date, to: Date) {
  if (from.toDateString() === to.toDateString()) {
    return formatEventDate(from);
  }

  return `${formatEventDate(from)} to ${formatEventDate(to)}`;
}

function getEventInitials(title: string) {
  const words = title.split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]).join('');
  return initials.toUpperCase() || 'R';
}

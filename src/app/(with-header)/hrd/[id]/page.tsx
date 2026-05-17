import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import AdminPageAction from '@/components/client/AdminPageAction';
import StoredImageSlot from '@/components/client/StoredImage.slot';
import DSButton from '@/components/ds/DSButton';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { AdminRole } from '@/entities/AdminRole';
import { ImageSize } from '@/entities/Image';
import { HeraldView, getHeraldView } from '@/server/heralds';
import styles from './page.module.css';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const view = await getHeraldView(id);

  if (!view) {
    return {
      title: 'Herald Not Found',
      description: 'The requested herald does not exist.',
    };
  }

  return {
    title: `${view.displayName} • Relicry`,
    description: view.summary ?? `Details for the herald ${view.displayName}.`,
  };
}

export default async function HeraldPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <DSPage>
      <Suspense fallback={<div>Loading herald data...</div>}>
        <HeraldPageData params={params} />
      </Suspense>
    </DSPage>
  );
}

async function HeraldPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { id } = await params;
  const view = await getHeraldView(id);

  if (!view) notFound();

  const { herald, event, artist } = view;
  return (
    <section className={styles.root}>
      <section className={styles.hero}>
        {view.bannerImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={view.bannerImageUrl} alt="" className={styles.bannerImage} aria-hidden="true" />
        ) : null}
        <div className={styles.heroContent}>
          <div className={styles.profileMark}>
            <HeraldProfileImage view={view} />
          </div>

          <div className={styles.titleBlock}>
            <div className={styles.badgeRow}>
              <span className={styles.badge}>Herald</span>
              {artist ? <span className={styles.badge}>Artist</span> : null}
              {herald.limitedTimeAtEvent ? <span className={styles.badge}>Limited Time</span> : null}
            </div>
            <DSText.Eyebrow>Event herald</DSText.Eyebrow>
            <DSText.Heading as="h1" size="2xl" className={styles.title}>{view.displayName}</DSText.Heading>
            {view.summary ? (
              <DSText.Body size="lg" tone="muted" className={styles.summary}>
                {view.summary}
              </DSText.Body>
            ) : null}
          </div>

          <div className={styles.metaGrid}>
            <MetaItem label="Event" value={event?.title ?? herald.eventId} />
            <MetaItem label="Availability" value={formatAvailability(view)} />
            <MetaItem label="Herald ID" value={herald.id} />
          </div>

          <DSSection.Actions>
            <DSButton href="/heralds" label="All Heralds" />
            {event ? <DSButton href={`/${event.id}`} label="View Event" variant="secondary" /> : null}
            <AdminPageAction href={`/${herald.id}/edit`} label="Edit Herald" requiredRole={AdminRole.EventAdmin} />
          </DSSection.Actions>
        </div>
      </section>

      <div className={styles.detailsGrid}>
        <DSSection.Card>
          <DSSection.Heading>
            <DSText.Eyebrow>Links</DSText.Eyebrow>
            <DSText.Heading as="h2" size="lg">Profile Sources</DSText.Heading>
          </DSSection.Heading>
          <ul className={styles.linkList}>
            <li><Link href={`/${herald.userId}`}>User: {view.user?.displayName || herald.userId}</Link></li>
            {artist ? <li><Link href={`/${artist.id}`}>Artist: {artist.name}</Link></li> : null}
            {event ? <li><Link href={`/${event.id}`}>Event: {event.title}</Link></li> : null}
          </ul>
        </DSSection.Card>

        <DSSection.Card>
          <DSSection.Heading>
            <DSText.Eyebrow>Vendor table</DSText.Eyebrow>
            <DSText.Heading as="h2" size="lg">Map Pin</DSText.Heading>
          </DSSection.Heading>
          <DSText.Body tone="muted">
            {herald.mapPin.id} at {herald.mapPin.x}, {herald.mapPin.y}
          </DSText.Body>
        </DSSection.Card>

        <DSSection.Card>
          <DSSection.Heading>
            <DSText.Eyebrow>Promoted</DSText.Eyebrow>
            <DSText.Heading as="h2" size="lg">Items</DSText.Heading>
          </DSSection.Heading>
          {view.promotedItemIds.length > 0 ? (
            <ul className={styles.linkList}>
              {view.promotedItemIds.map((itemId) => (
                <li key={itemId}><Link href={`/${itemId}`}>{itemId}</Link></li>
              ))}
            </ul>
          ) : (
            <DSText.Body tone="muted">No promoted items are linked yet.</DSText.Body>
          )}
        </DSSection.Card>
      </div>
    </section>
  );
}

function HeraldProfileImage({ view }: Readonly<{ view: HeraldView }>) {
  if (view.profileImage?.type === 'url') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={view.profileImage.url} alt="" className={styles.profileImage} aria-hidden="true" />;
  }

  if (view.profileImage?.type === 'stored') {
    return (
      <StoredImageSlot
        image={view.profileImage.image}
        size={ImageSize.Thumb}
        alt=""
        className={styles.profileImage}
        eager
      />
    );
  }

  return <span>{getInitials(view.displayName)}</span>;
}

function MetaItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className={styles.metaItem}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{value}</span>
    </div>
  );
}

function formatAvailability(view: HeraldView) {
  const { herald, event } = view;
  if (herald.limitedTimeAtEvent) {
    return formatDateRange(herald.limitedTimeAtEvent.from, herald.limitedTimeAtEvent.to);
  }
  if (event) {
    return formatDateRange(event.running.from, event.running.to);
  }
  return 'Event duration';
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatDateRange(from: Date, to: Date) {
  if (from.toDateString() === to.toDateString()) {
    return formatDate(from);
  }

  return `${formatDate(from)} to ${formatDate(to)}`;
}

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'H';
}

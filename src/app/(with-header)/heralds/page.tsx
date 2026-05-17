import { Suspense } from 'react';
import Link from 'next/link';
import AdminPageAction from '@/components/client/AdminPageAction';
import StoredImageSlot from '@/components/client/StoredImage.slot';
import DSButton from '@/components/ds/DSButton';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { AdminRole } from '@/entities/AdminRole';
import { ImageSize } from '@/entities/Image';
import { HeraldView, getHeraldViews } from '@/server/heralds';
import { connection } from 'next/server';
import styles from './page.module.css';

export function generateMetadata() {
  return {
    title: 'Heralds • Relicry',
    description: 'Participating Relicry vendors and hosts.',
  };
}

export default function HeraldsPage() {
  return (
    <DSPage>
      <DSSection.Card background="darkBrown" padding="thick">
        <DSSection.Heading>
          <DSText.Eyebrow>Event hosts</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl">Heralds</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body size="lg" tone="muted">
            Browse the vendors, artists, and hosts participating in Relicry events.
          </DSText.Body>
        </DSSection.Text>
        <DSSection.Actions>
          <AdminPageAction href="/heralds/new" label="New Herald" requiredRole={AdminRole.EventAdmin} />
        </DSSection.Actions>
      </DSSection.Card>

      <Suspense fallback={<HeraldsLoading />}>
        <HeraldsPageData />
      </Suspense>
    </DSPage>
  );
}

function HeraldsLoading() {
  return (
    <DSSection.Card>
      <DSText.Body tone="muted">Loading heralds...</DSText.Body>
    </DSSection.Card>
  );
}

async function HeraldsPageData() {
  await connection();
  const heralds = await getHeraldViews();

  if (heralds.length === 0) {
    return (
      <DSSection.Card>
        <DSText.Body tone="muted">No heralds have been announced yet.</DSText.Body>
      </DSSection.Card>
    );
  }

  return (
    <DSSection>
      <div className={styles.grid}>
        {heralds.map((heraldView) => (
          <HeraldCard key={heraldView.herald.id} view={heraldView} />
        ))}
      </div>
    </DSSection>
  );
}

function HeraldCard({ view }: Readonly<{ view: HeraldView }>) {
  const { herald, event } = view;
  const eventTitle = event?.title ?? herald.eventId;

  return (
    <article className={styles.card}>
      <Link href={`/${herald.id}`} className={styles.cardLink} aria-label={`View herald: ${view.displayName}`} />
      <div className={styles.banner}>
        {view.bannerImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={view.bannerImageUrl} alt="" className={styles.bannerImage} aria-hidden="true" />
        ) : null}
        <div className={styles.avatar}>
          <HeraldProfileImage view={view} />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>Herald</span>
          {view.artist ? <span className={styles.badge}>Artist</span> : null}
          {herald.limitedTimeAtEvent ? <span className={styles.badge}>Limited Time</span> : null}
        </div>
        <DSText.Heading as="h2" size="lg" className={styles.title}>
          {view.displayName}
        </DSText.Heading>
        <div className={styles.metaRow}>
          <DSText.Caption>{eventTitle}</DSText.Caption>
          {event ? <DSText.Caption>{formatDateRange(event.running.from, event.running.to)}</DSText.Caption> : null}
        </div>
        {view.summary ? (
          <DSText.Body tone="muted" className={styles.summary}>{view.summary}</DSText.Body>
        ) : (
          <DSText.Body tone="muted" className={styles.summary}>Participating at {eventTitle}.</DSText.Body>
        )}
        <div className={styles.actions}>
          <DSSection.Actions>
            <DSButton href={`/${herald.id}`} label="View Herald" />
            <AdminPageAction href={`/${herald.id}/edit`} label="Edit Herald" requiredRole={AdminRole.EventAdmin} />
          </DSSection.Actions>
        </div>
      </div>
    </article>
  );
}

function HeraldProfileImage({ view }: Readonly<{ view: HeraldView }>) {
  if (view.profileImage?.type === 'url') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={view.profileImage.url} alt="" className={styles.avatarImage} aria-hidden="true" />;
  }

  if (view.profileImage?.type === 'stored') {
    return (
      <StoredImageSlot
        image={view.profileImage.image}
        size={ImageSize.Thumb}
        alt=""
        className={styles.avatarImage}
      />
    );
  }

  return <span>{getInitials(view.displayName)}</span>;
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

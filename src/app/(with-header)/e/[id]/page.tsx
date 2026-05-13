import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getEvent } from '@/server/cache/event.cache';
import { connection } from 'next/server';
import StoredImageSlot from '@/components/client/StoredImage.slot';
import DSText from '@/components/ds/DSText';
import DSButton from '@/components/ds/DSButton';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import AdminPageAction from '@/components/client/AdminPageAction';
import { AdminRole } from '@/entities/AdminRole';
import { ImageSize } from '@/entities/Image';
import type { Event } from '@/entities/Event';
import type { Reward } from '@/entities/Reward';
import { RewardDB } from '@/server/db/reward.db';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import styles from './page.module.css';

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
    <DSPage>
      <DSPage.Back href="/events" label="Back to Events" />
      <Suspense fallback={<EventLoading />}>
        <EventPageData params={params} />
      </Suspense>
    </DSPage>
  );
}

function EventLoading() {
  return (
    <DSSection.Card>
      <DSText.Body tone="muted">Loading event data...</DSText.Body>
    </DSSection.Card>
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
    <section className={styles.root}>
      <EventHero event={event} rewardCount={activeRewards.length} />
      <RewardsSection event={event} rewards={activeRewards} />
    </section>
  );
}

function EventHero({
  event,
  rewardCount,
}: Readonly<{
  event: Event;
  rewardCount: number;
}>) {
  const title = event.title.trim() || 'Untitled Event';
  const status = getEventStatus(event);
  const image = event.image?.[ImageSize.Banner] ?? event.image?.[ImageSize.Thumb] ?? null;

  return (
    <article className={styles.hero} data-status={status.key}>
      <div className={styles.heroMedia}>
        {image ? (
          <StoredImageSlot
            image={image}
            size={ImageSize.Banner}
            alt={title}
            className={styles.heroImage}
            eager
          />
        ) : (
          <div className={styles.heroFallback} aria-hidden="true">
            <span>{getEventInitials(title)}</span>
          </div>
        )}
        <span className={styles.statusBadge}>{status.label}</span>
      </div>
      <div className={styles.heroPanel}>
        <div className={styles.titleBlock}>
          <DSText.Eyebrow>Event</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl" className={styles.title}>
            {title}
          </DSText.Heading>
          <DSText.Body size="lg" tone="muted" className={styles.description}>
            {event.description}
          </DSText.Body>
        </div>

        <div className={styles.metaGrid}>
          <MetaItem label="Dates" value={formatEventDateRange(event.running.from, event.running.to)} />
          <MetaItem label="Event ID" value={event.id} />
          <MetaItem label="Rewards" value={`${rewardCount} ${rewardCount === 1 ? 'level' : 'levels'}`} />
        </div>

        <DSSection.Actions>
          <AdminPageAction
            href={`/${event.id}/starter-deck-scan`}
            label="Starter Deck Scan"
            requiredRole={AdminRole.EventAdmin}
          />
          <AdminPageAction
            href={`/${event.id}/edit`}
            label="Edit Event"
            requiredRole={AdminRole.EventAdmin}
            variant="secondary"
          />
        </DSSection.Actions>
      </div>
    </article>
  );
}

function MetaItem({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className={styles.metaItem}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{value}</span>
    </div>
  );
}

function RewardsSection({
  event,
  rewards,
}: Readonly<{
  event: Event;
  rewards: Reward[];
}>) {
  return (
    <DSSection className={styles.rewardsSection}>
      <DSSection.Heading>
        <DSText.Eyebrow>Event rewards</DSText.Eyebrow>
        <DSText.Heading as="h2" size="xl">Reward levels</DSText.Heading>
      </DSSection.Heading>
      {rewards.length === 0 ? (
        <DSSection.Card>
          <DSText.Body tone="muted">No rewards are configured for this event.</DSText.Body>
        </DSSection.Card>
      ) : (
        <div className={styles.rewardGrid}>
          {rewards.map((reward) => (
            <RewardCard key={`${reward.eventId}-${reward.level}`} event={event} reward={reward} />
          ))}
        </div>
      )}
    </DSSection>
  );
}

function RewardCard({
  event,
  reward,
}: Readonly<{
  event: Event;
  reward: Reward;
}>) {
  return (
    <article className={styles.rewardCard}>
      <span className={styles.rewardLevel}>Challenge Level {reward.level}</span>
      <DSText.Heading as="h3" size="lg" className={styles.rewardTitle}>
        Reward Information
      </DSText.Heading>
      <DSSection.Text>
        <DSText.Caption>Quest: {reward.questId ?? 'None'}</DSText.Caption>
        <DSText.Caption>Scene: {reward.sceneId ?? 'None'}</DSText.Caption>
      </DSSection.Text>
      <DSSection.Actions>
        <DSButton href={`/${event.id}/r/${reward.level}`} label="View Reward" />
      </DSSection.Actions>
    </article>
  );
}

type EventStatus = {
  key: 'archived' | 'past' | 'ongoing' | 'upcoming';
  label: string;
};

function getEventStatus(event: Event): EventStatus {
  const now = new Date();

  if (event.archivedAt) {
    return { key: 'archived', label: 'Archived' };
  }
  if (event.running.to < now) {
    return { key: 'past', label: 'Completed' };
  }
  if (event.running.from <= now) {
    return { key: 'ongoing', label: 'Live now' };
  }
  return { key: 'upcoming', label: 'Upcoming' };
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

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getEvent } from '@/server/cache/event.cache';
import { connection } from 'next/server';
import StoredImageSlot from '@/components/client/StoredImage.slot';
import DSAvatar from '@/components/ds/DSAvatar';
import DSText from '@/components/ds/DSText';
import DSButton from '@/components/ds/DSButton';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import AdminPageAction from '@/components/client/AdminPageAction';
import { AdminRole } from '@/entities/AdminRole';
import { ImageSize } from '@/entities/Image';
import type { Event } from '@/entities/Event';
import type { EventQuest } from '@/entities/EventQuest';
import type { Herald } from '@/entities/Herald';
import type { Reward } from '@/entities/Reward';
import type { User } from '@/entities/User';
import { getArtist } from '@/server/cache/artist.cache';
import { getUser } from '@/server/cache/user.cache';
import { EventQuestDB } from '@/server/db/eventQuest.db';
import { HeraldDB } from '@/server/db/herald.db';
import { RewardDB } from '@/server/db/reward.db';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { getHeraldDisplayName } from '@/server/heralds';
import StarterDecksSection from './StarterDecksSection';
import styles from './page.module.css';

type Params = { id: string };
type HeraldView = {
  herald: Herald;
  name: string;
  summary: string | null;
  user: User | null;
};

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

  const firestoreAdmin = getFirestoreAdmin();
  const [eventQuests, heralds, rewards] = await Promise.all([
    new EventQuestDB(firestoreAdmin).getBy({
      where: [{ field: 'eventId', op: '==', value: event.id }],
    }),
    new HeraldDB(firestoreAdmin).getBy({
      where: [{ field: 'eventId', op: '==', value: event.id }],
    }),
    new RewardDB(firestoreAdmin).getBy({
      where: [{ field: 'eventId', op: '==', value: event.id }],
      sortBy: { field: 'level', direction: 'asc' },
    }),
  ]);
  const activeEventQuests = eventQuests
    .filter((eventQuest) => eventQuest.archivedAt === null)
    .sort((a, b) => a.questClaimed.from.getTime() - b.questClaimed.from.getTime());
  const activeHeralds = await buildHeraldViews(
    heralds.filter((herald) => herald.archivedAt === null),
  );
  const activeRewards = rewards.filter((reward) => reward.archivedAt === null);

  return (
    <section className={styles.root}>
      <EventHero event={event} rewardCount={activeRewards.length} />
      <HeraldsSection heralds={activeHeralds} />
      <StarterDecksSection eventId={event.id} />
      <EventQuestsSection eventQuests={activeEventQuests} />
      <RewardsSection event={event} rewards={activeRewards} />
    </section>
  );
}

async function buildHeraldViews(heralds: Herald[]): Promise<HeraldView[]> {
  const views = await Promise.all(heralds.map(async (herald) => {
    const [artist, user] = await Promise.all([
      herald.artistId ? getArtist(herald.artistId) : Promise.resolve(null),
      getUser(herald.userId),
    ]);
    const name = getHeraldDisplayName(herald, artist, user);
    const summary = herald.override.summary || artist?.summary || null;

    return { herald, name, summary, user };
  }));

  return views.sort((a, b) => a.name.localeCompare(b.name));
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

function HeraldsSection({
  heralds,
}: Readonly<{
  heralds: HeraldView[];
}>) {
  return (
    <DSSection className={styles.heraldsSection}>
      <DSSection.Heading>
        <DSText.Eyebrow>Event heralds</DSText.Eyebrow>
        <DSText.Heading as="h2" size="xl">Associated heralds</DSText.Heading>
      </DSSection.Heading>
      {heralds.length === 0 ? (
        <DSSection.Card>
          <DSText.Body tone="muted">No heralds are configured for this event.</DSText.Body>
        </DSSection.Card>
      ) : (
        <div className={styles.heraldGrid}>
          {heralds.map((heraldView) => (
            <HeraldCard key={heraldView.herald.id} heraldView={heraldView} />
          ))}
        </div>
      )}
    </DSSection>
  );
}

function HeraldCard({
  heraldView,
}: Readonly<{
  heraldView: HeraldView;
}>) {
  const { herald, name, summary, user } = heraldView;

  return (
    <article className={styles.heraldCard}>
      <div className={styles.heraldHeader}>
        <DSAvatar
          user={{
            displayName: name,
            profileImage: user?.profileImage,
          }}
          size="lg"
        />
        <div className={styles.heraldTitleBlock}>
          <span className={styles.heraldLevel}>Herald</span>
          <DSText.Heading as="h3" size="lg" className={styles.heraldTitle}>
            {name}
          </DSText.Heading>
        </div>
      </div>
      <DSSection.Text>
        {summary && (
          <DSText.Body size="sm" tone="muted" className={styles.heraldSummary}>
            {summary}
          </DSText.Body>
        )}
        <DSText.Caption>Map pin: {herald.mapPin.id}</DSText.Caption>
        {herald.mapPin.note && <DSText.Caption>{herald.mapPin.note}</DSText.Caption>}
        {herald.limitedTimeAtEvent && (
          <DSText.Caption>
            Available {formatEventDateRange(herald.limitedTimeAtEvent.from, herald.limitedTimeAtEvent.to)}
          </DSText.Caption>
        )}
      </DSSection.Text>
      <DSSection.Actions>
        <DSButton href={`/${herald.id}`} label="View Herald" />
      </DSSection.Actions>
    </article>
  );
}

function EventQuestsSection({
  eventQuests,
}: Readonly<{
  eventQuests: EventQuest[];
}>) {
  return (
    <DSSection className={styles.eventQuestsSection}>
      <DSSection.Heading>
        <DSText.Eyebrow>Event quests</DSText.Eyebrow>
        <DSText.Heading as="h2" size="xl">Associated quests</DSText.Heading>
      </DSSection.Heading>
      {eventQuests.length === 0 ? (
        <DSSection.Card>
          <DSText.Body tone="muted">No quests are configured for this event.</DSText.Body>
        </DSSection.Card>
      ) : (
        <div className={styles.questGrid}>
          {eventQuests.map((eventQuest) => (
            <EventQuestCard key={`${eventQuest.eventId}-${eventQuest.questId}`} eventQuest={eventQuest} />
          ))}
        </div>
      )}
    </DSSection>
  );
}

function EventQuestCard({
  eventQuest,
}: Readonly<{
  eventQuest: EventQuest;
}>) {
  const threadCount = eventQuest.threads.length;
  const title = eventQuest.title.trim() || eventQuest.questId;

  return (
    <article className={styles.questCard}>
      <span className={styles.questLevel}>{eventQuest.questId}</span>
      <DSText.Heading as="h3" size="lg" className={styles.questTitle}>
        {title}
      </DSText.Heading>
      <DSSection.Text>
        <DSText.Body size="sm" tone="muted" className={styles.questDescription}>
          {eventQuest.description.start}
        </DSText.Body>
        <DSText.Caption>
          {threadCount} {threadCount === 1 ? 'thread' : 'threads'}, claimable {formatEventDateRange(eventQuest.questClaimed.from, eventQuest.questClaimed.to)}
        </DSText.Caption>
        <DSText.Caption>Reward: {eventQuest.rewardId}</DSText.Caption>
      </DSSection.Text>
      <DSSection.Actions>
        <DSButton href={`/${eventQuest.questId}`} label="View Quest" />
      </DSSection.Actions>
    </article>
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

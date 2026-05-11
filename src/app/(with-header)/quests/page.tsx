import DSButton from '@/components/ds/DSButton';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { VersionedQuest } from '@/entities/Quest';
import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { getQuests } from '@/server/cache/quest.cache';
import styles from './page.module.css';

export function generateMetadata() {
  return {
    title: 'Quests • Relicry',
    description: 'All revealed quests.',
  };
}

export default async function QuestsPage() {
  return (
    <DSSection>
      <div className={styles.pageHeader}>
        <DSText.Heading as="h1">Quests</DSText.Heading>
        <DSButton href="/q/new" label="New Quest" />
      </div>
      <Suspense fallback={<div>Loading quests...</div>}>
        <QuestsPageData />
      </Suspense>
    </DSSection>
  );
}

async function QuestsPageData() {
  await connection();
  const now = new Date();
  const quests = await getQuests();
  const visibleQuests = quests.filter((quest) => !quest.archived && quest.revealed.at <= now);

  if (visibleQuests.length === 0) {
    return (
      <div className={styles.emptyState}>
        <DSText.Body tone="muted">No revealed quests are available yet.</DSText.Body>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {visibleQuests.map((quest) => (
        <QuestListItem key={`${quest.id}-${quest.season}`} quest={quest} />
      ))}
    </div>
  );
}

function QuestListItem({ quest }: { quest: VersionedQuest }) {
  const href = `/${quest.id}/${quest.season}`;

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <DSText.Heading as="h2" size="xl">
          <Link href={href} className={styles.questLink}>
            {quest.faction}
          </Link>
        </DSText.Heading>
        <DSText.Caption>
          Level {quest.level} • Season {quest.season} • Revealed {formatQuestDate(quest.revealed.at)}
        </DSText.Caption>
      </div>
      <div className={styles.cardActions}>
        <DSButton href={href} label="View Quest" />
        <DSButton href={`${href}/edit`} label="Edit Quest" />
      </div>
    </article>
  );
}

function formatQuestDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

import DSButton from '@/components/ds/DSButton';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import AdminPageAction from '@/components/client/AdminPageAction';
import { AdminRole } from '@/entities/AdminRole';
import { VersionedQuest } from '@/entities/Quest';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { getQuests } from '@/server/cache/quest.cache';

export function generateMetadata() {
  return {
    title: 'Quests • Relicry',
    description: 'All revealed quests.',
  };
}

export default async function QuestsPage() {
  return (
    <DSPage>
      <DSSection.Card background="darkBrown" padding="thick">
        <DSSection.Heading>
          <DSText.Eyebrow>Adventures</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl">Quests</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body size="lg" tone="muted">
            Browse revealed quests, see their level and season, and jump into the encounters that
            move each event story forward.
          </DSText.Body>
        </DSSection.Text>
        <AdminPageAction href="/q/new" label="New Quest" requiredRole={AdminRole.SuperAdmin} />
      </DSSection.Card>

      <Suspense fallback={<QuestsLoading />}>
        <QuestsPageData />
      </Suspense>
    </DSPage>
  );
}

function QuestsLoading() {
  return (
    <DSSection.Card>
      <DSText.Body tone="muted">Loading quests...</DSText.Body>
    </DSSection.Card>
  );
}

async function QuestsPageData() {
  await connection();
  const now = new Date();
  const quests = await getQuests();
  const visibleQuests = quests.filter((quest) => !quest.archived && quest.revealed.at <= now);

  if (visibleQuests.length === 0) {
    return (
      <DSSection.Card>
        <DSText.Body tone="muted">No revealed quests are available yet.</DSText.Body>
      </DSSection.Card>
    );
  }

  return (
    <DSSection>
      {visibleQuests.map((quest) => (
        <QuestListItem key={`${quest.id}-${quest.season}`} quest={quest} />
      ))}
    </DSSection>
  );
}

function QuestListItem({ quest }: { quest: VersionedQuest }) {
  const href = `/${quest.id}/${quest.season}`;

  return (
    <DSSection.Card>
      <DSSection.Heading>
        <DSText.Heading as="h2" size="xl">
          {quest.faction}
        </DSText.Heading>
        <DSText.Caption>
          Level {quest.level}, Season {quest.season}, Revealed {formatQuestDate(quest.revealed.at)}
        </DSText.Caption>
      </DSSection.Heading>
      <DSSection.Actions>
        <DSButton href={href} label="View Quest" />
        <DSButton href={`${href}/edit`} label="Edit Quest" />
      </DSSection.Actions>
    </DSSection.Card>
  );
}

function formatQuestDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

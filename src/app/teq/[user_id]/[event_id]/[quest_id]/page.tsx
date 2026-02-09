import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getTrackEventQuest } from '@/server/cache/trackEventQuest.cache';
import { connection } from 'next/server';

type Params = { user_id: string; event_id: string; quest_id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { user_id, event_id, quest_id } = await params;
  const trackEventQuest = await getTrackEventQuest(user_id, event_id, quest_id);

  if (!trackEventQuest) {
    return {
      title: 'Event Quest Not Found',
      description: 'The requested event quest does not exist.',
    };
  }

  return {
    title: `${trackEventQuest.questId} • Relicry`,
    description: trackEventQuest.eventId,
  };
}

export default async function EventQuestPage(
  { params }: { params: Promise<Params> }
) {
  return (
    <div>
      <h1>Event Quest Details</h1>
      <Suspense fallback={<div>Loading event quest data...</div>}>
        <EventQuestPageData params={params} />
      </Suspense>
    </div>
  );
}

async function EventQuestPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
  const { user_id, event_id, quest_id } = await params;
  const trackEventQuest = await getTrackEventQuest(user_id, event_id, quest_id);

  if (!trackEventQuest) notFound();

  return (
    <div>
      <h1>Event Quest</h1>
      <p>User ID: {trackEventQuest.userId}</p>
      <p>Event ID: {trackEventQuest.eventId}</p>
      <p>Quest ID: {trackEventQuest.questId}</p>
    </div>
  );
}

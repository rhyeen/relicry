import { TrackEventQuest } from '@/entities/Trackers';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { TrackQuestEventDB } from '@/server/db/trackers.db';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Params = { user_id: string; event_id: string; quest_id: string };

export const getTrackEventQuest = cache(async (user_id: string, event_id: string, quest_id: string): Promise<
  TrackEventQuest | null
> => {
  return new TrackQuestEventDB(firestoreAdmin).getFromParts(user_id, event_id, quest_id);
});

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
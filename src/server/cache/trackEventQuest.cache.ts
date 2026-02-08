import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { TrackEventQuest } from '@/entities/Trackers';
import { TrackQuestEventDB } from '@/server/db/trackers.db';

export const trackEventQuestTags = {
  data: (userId: string, eventId: string, questId: string) => `d/track-event-quest/${userId}/${eventId}/${questId}`,
};

export const TRACK_EVENT_QUEST_LIFE = 'avoidCaching';

export async function getTrackEventQuest(
  userId: string,
  eventId: string,
  questId: string,
): Promise<TrackEventQuest | null> {
  'use cache';

  cacheLife(TRACK_EVENT_QUEST_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(trackEventQuestTags.data(userId, eventId, questId));

  return new TrackQuestEventDB(getFirestoreAdmin()).getFromParts(userId, eventId, questId);
}

export async function invalidateTrackEventQuestNow(
  userId: string,
  eventId: string,
  questId: string,
): Promise<void> {
  updateTag(trackEventQuestTags.data(userId, eventId, questId));
}

export async function invalidateTrackEventQuestSoon(
  userId: string,
  eventId: string,
  questId: string,
): Promise<void> {
  revalidateTag(trackEventQuestTags.data(userId, eventId, questId), 'max');
}

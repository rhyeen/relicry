import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { Event } from '@/entities/Event';
import { EventDB } from '@/server/db/event.db';

export const eventTags = {
  data: (id: string) => `d/event/${id}`,
};

export const EVENT_LIFE = 'expectedChangeLowConsequenceIfStale';

export async function getEvent(id: string): Promise<Event | null> {
  'use cache';

  cacheLife(EVENT_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(eventTags.data(id));

  return new EventDB(getFirestoreAdmin()).getFromParts(id);
}

export async function invalidateEventNow(id: string): Promise<void> {
  updateTag(eventTags.data(id));
}

export async function invalidateEventSoon(id: string): Promise<void> {
  revalidateTag(eventTags.data(id), 'max');
}

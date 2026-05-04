import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { Event, getEventId } from '@/entities/Event';
import { EventDB } from '@/server/db/event.db';

export const eventTags = {
  data: (id: string) => `d/event/${id}`,
  list: 'd/event/list',
};

export const EVENT_LIFE = 'expectedChangeLowConsequenceIfStale';

function getEventTagId(id: string): string {
  return getEventId(id);
}

export async function getEvent(id: string): Promise<Event | null> {
  'use cache';

  cacheLife(EVENT_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(eventTags.data(getEventTagId(id)));

  return new EventDB(getFirestoreAdmin()).getFromParts(id);
}

export async function getEvents(): Promise<Event[]> {
  'use cache';

  cacheLife(EVENT_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(eventTags.list);

  return new EventDB(getFirestoreAdmin()).getBy({
    where: [],
    sortBy: { field: 'running.from', direction: 'asc' },
    limit: 100,
  });
}

export async function invalidateEventNow(id: string): Promise<void> {
  updateTag(eventTags.data(getEventTagId(id)));
}

export async function invalidateEventSoon(id: string): Promise<void> {
  revalidateTag(eventTags.data(getEventTagId(id)), 'max');
}

export async function invalidateEventListSoon(): Promise<void> {
  revalidateTag(eventTags.list, 'max');
}

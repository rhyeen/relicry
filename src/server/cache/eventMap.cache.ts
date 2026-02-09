import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { EventMap } from '@/entities/EventMap';
import { EventMapDB } from '@/server/db/eventMap.db';

export const eventMapTags = {
  data: (id: string) => `d/event-map/${id}`,
};

export const EVENT_MAP_LIFE = 'expectedChangeLowConsequenceIfStale';

export async function getEventMap(id: string): Promise<EventMap | null> {
  'use cache';

  cacheLife(EVENT_MAP_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(eventMapTags.data(id));

  return new EventMapDB(getFirestoreAdmin()).getFromParts(id);
}

export async function invalidateEventMapNow(id: string): Promise<void> {
  updateTag(eventMapTags.data(id));
}

export async function invalidateEventMapSoon(id: string): Promise<void> {
  revalidateTag(eventMapTags.data(id), 'max');
}

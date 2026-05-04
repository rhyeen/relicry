import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { getEventId } from '@/entities/Event';
import { getUniqueRewardId, UniqueReward } from '@/entities/Reward';
import { UniqueRewardDB } from '@/server/db/uniqueReward.db';

export const uniqueRewardTags = {
  data: (id: string) => `d/unique-reward/${id}`,
  list: (eventId: string, level: number | string) => `d/unique-reward/list/${eventId}/${level}`,
};

export const UNIQUE_REWARD_LIFE = 'unlikelyChange';

function getUniqueRewardTagId(id: string): string {
  return getUniqueRewardId(id);
}

function getUniqueRewardListEventId(eventId: string): string {
  return getEventId(eventId);
}

export async function getUniqueReward(id: string): Promise<UniqueReward | null> {
  'use cache';

  cacheLife(UNIQUE_REWARD_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(uniqueRewardTags.data(getUniqueRewardTagId(id)));

  return new UniqueRewardDB(getFirestoreAdmin()).getFromParts(id);
}

export async function getUniqueRewards(eventId: string, level: number | string): Promise<UniqueReward[]> {
  'use cache';

  cacheLife(UNIQUE_REWARD_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(uniqueRewardTags.list(getUniqueRewardListEventId(eventId), level));

  const numericLevel = typeof level === 'string' ? Number.parseInt(level, 10) : level;
  return new UniqueRewardDB(getFirestoreAdmin()).getByReward(eventId, numericLevel);
}

export async function invalidateUniqueRewardNow(id: string): Promise<void> {
  updateTag(uniqueRewardTags.data(getUniqueRewardTagId(id)));
}

export async function invalidateUniqueRewardSoon(id: string): Promise<void> {
  revalidateTag(uniqueRewardTags.data(getUniqueRewardTagId(id)), 'max');
}

export async function invalidateUniqueRewardListSoon(eventId: string, level: number | string): Promise<void> {
  revalidateTag(uniqueRewardTags.list(getUniqueRewardListEventId(eventId), level), 'max');
}

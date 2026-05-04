import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { Reward } from '@/entities/Reward';
import { RewardDB } from '@/server/db/reward.db';
import { getEventId } from '@/entities/Event';

export const rewardTags = {
  data: (eventId: string, level: number | string) => `d/reward/${eventId}/${level}`,
};

export const REWARD_LIFE = 'unlikelyChange';

function getRewardTagEventId(eventId: string): string {
  return getEventId(eventId);
}

export async function getReward(eventId: string, level: number | string): Promise<Reward | null> {
  'use cache';

  cacheLife(REWARD_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(rewardTags.data(getRewardTagEventId(eventId), level));

  const _level = typeof level === 'string' ? parseInt(level, 10) : level;
  return new RewardDB(getFirestoreAdmin()).getFromParts(eventId, _level);
}

export async function invalidateRewardNow(eventId: string, level: number | string): Promise<void> {
  updateTag(rewardTags.data(getRewardTagEventId(eventId), level));
}

export async function invalidateRewardSoon(eventId: string, level: number | string): Promise<void> {
  revalidateTag(rewardTags.data(getRewardTagEventId(eventId), level), 'max');
}

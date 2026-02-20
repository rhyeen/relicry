import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { QuestToken } from '@/entities/Quest';
import { QuestTokenDB } from '../db/questToken.db';
import { Faction } from '@/entities/Faction';

export const questTokenTags = {
  anyTokenData: (id: string, faction?: string, season?: number) => `d/questToken/${id}/${faction ?? 'any'}/${season ?? 'latest'}`,
};

export const QUEST_TOKEN_LIFE = 'unlikelyChange';

export async function getAnyOfToken(
  id: string,
  faction?: string,
  season?: number,
): Promise<QuestToken | null> {
  'use cache';

  cacheLife(QUEST_TOKEN_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(questTokenTags.anyTokenData(id, faction, season));

  return new QuestTokenDB(getFirestoreAdmin()).getAnyOfToken(id, faction as Faction, season);
}

export async function invalidateAnyTokenNow(id: string, faction?: string, season?: number): Promise<void> {
  updateTag(questTokenTags.anyTokenData(id, faction, season));
}

export async function invalidateAnyTokenSoon(id: string, faction?: string, season?: number): Promise<void> {
  revalidateTag(questTokenTags.anyTokenData(id, faction, season), 'max');
}

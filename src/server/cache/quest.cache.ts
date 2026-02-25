import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { getQuestDocId, VersionedQuest } from '@/entities/Quest';
import { QuestDB } from '@/server/db/quest.db';

export const questTags = {
  data: (id: string, season?: string) => `d/quest/${id}/${season ?? 'latest'}`,
};

export const QUEST_LIFE = 'unlikelyChange';

export async function getQuest(id: string, season?: string): Promise<VersionedQuest | null> {
  'use cache';

  cacheLife(QUEST_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(questTags.data(id, season));
  if (season) {
    return new QuestDB(getFirestoreAdmin()).get(getQuestDocId(id, parseInt(season)));
  }
  return new QuestDB(getFirestoreAdmin()).getLatest(id);
}

export async function invalidateQuestNow(id: string, season?: string): Promise<void> {
  updateTag(questTags.data(id, season));
}

export async function invalidateQuestSoon(id: string, season?: string): Promise<void> {
  revalidateTag(questTags.data(id, season), 'max');
}

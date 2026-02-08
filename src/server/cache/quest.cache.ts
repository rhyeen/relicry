import 'server-only';

import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { Quest } from '@/entities/Quest';
import { QuestDB } from '@/server/db/quest.db';

export const questTags = {
  data: (id: string) => `d/quest/${id}/latest`,
};

export const QUEST_LIFE = 'unlikelyChange';

export async function getQuest(id: string): Promise<Quest | null> {
  'use cache';

  cacheLife(QUEST_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(questTags.data(id));

  return new QuestDB(firestoreAdmin).getLatest(id);
}

export async function invalidateQuestNow(id: string): Promise<void> {
  updateTag(questTags.data(id));
}

export async function invalidateQuestSoon(id: string): Promise<void> {
  revalidateTag(questTags.data(id), 'max');
}

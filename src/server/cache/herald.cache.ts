import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { Herald } from '@/entities/Herald';
import { HeraldDB } from '@/server/db/herald.db';

export const heraldTags = {
  data: (id: string) => `d/herald/${id}`,
  list: 'd/herald/list',
};

export const HERALD_LIFE = 'expectedChangeLowConsequenceIfStale';

export async function getHerald(id: string): Promise<Herald | null> {
  'use cache';

  cacheLife(HERALD_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(heraldTags.data(id));

  return new HeraldDB(getFirestoreAdmin()).getFromParts(id);
}

export async function getHeralds(): Promise<Herald[]> {
  'use cache';

  cacheLife(HERALD_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(heraldTags.list);

  return new HeraldDB(getFirestoreAdmin()).getBy({
    where: [],
    sortBy: { field: 'createdAt', direction: 'desc' },
    limit: 100,
  });
}

export async function invalidateHeraldNow(id: string): Promise<void> {
  updateTag(heraldTags.data(id));
}

export async function invalidateHeraldSoon(id: string): Promise<void> {
  revalidateTag(heraldTags.data(id), 'max');
}

export async function invalidateHeraldListSoon(): Promise<void> {
  revalidateTag(heraldTags.list, 'max');
}

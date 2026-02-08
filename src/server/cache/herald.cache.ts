import 'server-only';

import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { Herald } from '@/entities/Herald';
import { HeraldDB } from '@/server/db/herald.db';

export const heraldTags = {
  data: (id: string) => `d/herald/${id}`,
};

export const HERALD_LIFE = 'expectedChangeLowConsequenceIfStale';

export async function getHerald(id: string): Promise<Herald | null> {
  'use cache';

  cacheLife(HERALD_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(heraldTags.data(id));

  return new HeraldDB(firestoreAdmin).getFromParts(id);
}

export async function invalidateHeraldNow(id: string): Promise<void> {
  updateTag(heraldTags.data(id));
}

export async function invalidateHeraldSoon(id: string): Promise<void> {
  revalidateTag(heraldTags.data(id), 'max');
}

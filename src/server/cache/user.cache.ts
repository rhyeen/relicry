import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { User } from '@/entities/User';
import { UserDB } from '@/server/db/user.db';

export const userTags = {
  data: (id: string) => `d/user/${id}`,
};

export const USER_LIFE = 'expectedChangeLowConsequenceIfStale';

export async function getUser(id: string): Promise<User | null> {
  'use cache';

  cacheLife(USER_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(userTags.data(id));

  return new UserDB(getFirestoreAdmin()).getFromParts(id);
}

export async function invalidateUserNow(id: string): Promise<void> {
  updateTag(userTags.data(id));
}

export async function invalidateUserSoon(id: string): Promise<void> {
  revalidateTag(userTags.data(id), 'max');
}

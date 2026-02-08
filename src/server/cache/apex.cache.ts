import 'server-only';

import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { StoredApex } from '@/entities/Apex';
import { ApexDB } from '@/server/db/apex.db';

export const apexTags = {
  data: (id: string, version: number | string) => `d/apex/${id}/${version}`,
};

export const APEX_LIFE = 'unlikelyChange';

export async function getApex(id: string, version: number | string): Promise<StoredApex | null> {
  'use cache';

  cacheLife(APEX_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(apexTags.data(id, version));

  const _version = typeof version === 'string' ? parseInt(version, 10) : version;
  return new ApexDB(firestoreAdmin).getFromParts(id, _version);
}

export async function invalidateApexNow(id: string, version: number | string): Promise<void> {
  updateTag(apexTags.data(id, version));
}

export async function invalidateApexSoon(id: string, version: number | string): Promise<void> {
  revalidateTag(apexTags.data(id, version), 'max');
}

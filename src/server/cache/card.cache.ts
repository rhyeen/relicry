import 'server-only';

import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { VersionedCard } from '@/entities/Card';
import { CardDB } from '@/server/db/card.db';

export const cardTags = {
  data: (id: string, version: number | string) => `d/card/${id}/${version}`,
};

export const CARD_LIFE = 'noChange';

export async function getCard(id: string, version: number | string): Promise<VersionedCard | null> {
  'use cache';
  
  cacheLife(CARD_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(cardTags.data(id, version));

  const _version = typeof version === 'string' ? parseInt(version, 10) : version;
  return new CardDB(firestoreAdmin).getFromParts(id, _version);
}

export async function invalidateCardNow(id: string, version: number | string): Promise<void> {
  updateTag(cardTags.data(id, version));
}

export async function invalidateCardSoon(id: string, version: number | string): Promise<void> {
  revalidateTag(cardTags.data(id, version), 'max');
}

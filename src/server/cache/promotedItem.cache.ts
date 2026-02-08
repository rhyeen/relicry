import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { PromotedItem } from '@/entities/PromotedItem';
import { PromotedItemDB } from '@/server/db/promotedItem.db';

export const promotedItemTags = {
  data: (id: string) => `d/promoted-item/${id}`,
};

export const PROMOTED_ITEM_LIFE = 'expectedChangeLowConsequenceIfStale';

export async function getPromotedItem(id: string): Promise<PromotedItem | null> {
  'use cache';

  cacheLife(PROMOTED_ITEM_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(promotedItemTags.data(id));

  return new PromotedItemDB(getFirestoreAdmin()).getFromParts(id);
}

export async function invalidatePromotedItemNow(id: string): Promise<void> {
  updateTag(promotedItemTags.data(id));
}

export async function invalidatePromotedItemSoon(id: string): Promise<void> {
  revalidateTag(promotedItemTags.data(id), 'max');
}

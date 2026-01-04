import 'server-only';

import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { Art } from '@/entities/Art';
import { ArtDB } from '@/server/db/art.db';

export const artTags = {
  data: (id: string) => `d/art/${id}`,
};

export const ART_LIFE = 'unlikelyChange';

export async function getArt(id: string): Promise<Art | null> {
  'use cache';
  
  cacheLife(ART_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(artTags.data(id));

  return new ArtDB(firestoreAdmin).getFromParts(id);
}

export async function invalidateArtNow(id: string): Promise<void> {
  updateTag(artTags.data(id));
}

export async function invalidateArtSoon(id: string): Promise<void> {
  revalidateTag(artTags.data(id), 'max');
}

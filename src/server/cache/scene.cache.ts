import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { Scene } from '@/entities/Scene';
import { SceneDB } from '@/server/db/scene.db';

export const sceneTags = {
  data: (id: string) => `d/scene/${id}`,
};

export const SCENE_LIFE = 'unlikelyChange';

export async function getScene(id: string): Promise<Scene | null> {
  'use cache';

  cacheLife(SCENE_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(sceneTags.data(id));

  return new SceneDB(getFirestoreAdmin()).getFromParts(id);
}

export async function invalidateSceneNow(id: string): Promise<void> {
  updateTag(sceneTags.data(id));
}

export async function invalidateSceneSoon(id: string): Promise<void> {
  revalidateTag(sceneTags.data(id), 'max');
}

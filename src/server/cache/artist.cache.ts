import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidatePath, revalidateTag, updateTag } from 'next/cache';
import { Artist } from '@/entities/Artist';
import { ArtistDB } from '@/server/db/artist.db';

export const artistTags = {
  data: (id: string) => `d/artist/${id}`,
  list: 'd/artists/list',
};

export const ARTIST_LIFE = 'expectedChangeLowConsequenceIfStale';

export async function getArtist(id: string): Promise<Artist | null> {
  'use cache';
  
  cacheLife(ARTIST_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(artistTags.data(id));

  return new ArtistDB(getFirestoreAdmin()).getFromParts(id);
}

export async function getArtists(): Promise<Artist[]> {
  'use cache';

  cacheLife(ARTIST_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(artistTags.list);

  const artists = await new ArtistDB(getFirestoreAdmin()).getBy({
    where: [],
    sortBy: { field: 'name', direction: 'asc' },
  });

  return artists.filter((artist) => artist.archivedAt === null);
}

export async function invalidateArtistNow(id: string): Promise<void> {
  updateTag(artistTags.data(id));
  updateTag(artistTags.list);
}

export async function revalidateArtistNow(id: string): Promise<void> {
  revalidateTag(artistTags.data(id), { expire: 0 });
  revalidateTag(artistTags.list, { expire: 0 });
  revalidatePath('/artists');
  revalidatePath(`/${id}`);
}

export async function invalidateArtistSoon(id: string): Promise<void> {
  revalidateTag(artistTags.data(id), 'max');
  revalidateTag(artistTags.list, 'max');
}

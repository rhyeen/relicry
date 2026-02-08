import 'server-only';

import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { VersionedDeck } from '@/entities/Deck';
import { DeckDB } from '@/server/db/deck.db';

export const deckTags = {
  data: (id: string) => `d/deck/${id}/latest`,
};

export const DECK_LIFE = 'expectedChangeLowConsequenceIfStale';

export async function getDeck(id: string): Promise<VersionedDeck | null> {
  'use cache';

  cacheLife(DECK_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(deckTags.data(id));

  return new DeckDB(firestoreAdmin).getLatest(id);
}

export async function invalidateDeckNow(id: string): Promise<void> {
  updateTag(deckTags.data(id));
}

export async function invalidateDeckSoon(id: string): Promise<void> {
  revalidateTag(deckTags.data(id), 'max');
}

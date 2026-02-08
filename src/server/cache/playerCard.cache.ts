import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { PlayerCard } from '@/entities/PlayerCard';
import { PlayerCardDB } from '@/server/db/playerCard.db';

export const playerCardTags = {
  data: (userId: string) => `d/player-cards/${userId}`,
};

export const PLAYER_CARD_LIFE = 'expectedChangeLowConsequenceIfStale';

export async function getPlayerCards(userId: string): Promise<PlayerCard[]> {
  'use cache';

  cacheLife(PLAYER_CARD_LIFE);
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag(playerCardTags.data(userId));

  return new PlayerCardDB(getFirestoreAdmin()).getByUserId(userId);
}

export async function invalidatePlayerCardsNow(userId: string): Promise<void> {
  updateTag(playerCardTags.data(userId));
}

export async function invalidatePlayerCardsSoon(userId: string): Promise<void> {
  revalidateTag(playerCardTags.data(userId), 'max');
}

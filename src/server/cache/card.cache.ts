import 'server-only';
import { getCardDocId, VersionedCard } from '@/entities/Card';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { CardDB } from '../db/card.db';
import { asNumber, CacheLifeValue, createCache } from './root.cache';

export const cardCache = createCache<VersionedCard, [string, number | string]>({
  getCacheTag: (id, version) => `card/${getCardDocId(id, asNumber(version))}`,
  cacheLifeValue: (): CacheLifeValue => 'noChange',
  getFromParts: (id, version) => new CardDB(firestoreAdmin).getFromParts(id, asNumber(version)),
});

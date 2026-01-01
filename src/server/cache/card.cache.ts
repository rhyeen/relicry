import 'server-only';
import { getCardDocId, VersionedCard } from '@/entities/Card';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { CardDB } from '../db/card.db';
import { CacheLifeValue, RootCache } from './root.cache';

class CardCache extends RootCache<VersionedCard, [string, number | string]> {
  protected getCacheTag(id: string, version: number | string): string {
    return `card/${getCardDocId(id, this.asNumber(version))}`;
  }

  protected cacheLifeValue(): CacheLifeValue {
    return 'noChange';
  }

  protected getFromParts(id: string, version: number | string): Promise<VersionedCard | null> {
    return new CardDB(firestoreAdmin).getFromParts(id, this.asNumber(version));
  }
}

export const cardCache = new CardCache();
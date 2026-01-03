import 'server-only';
import { Art } from '@/entities/Art';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { ArtDB } from '../db/art.db';
import { CacheLifeValue, RootCache } from './root.cache';

class ArtCache extends RootCache<Art, [string]> {
  protected getCacheTag(id: string): string {
    return `art/${id}`;
  }

  protected cacheLifeValue(): CacheLifeValue {
    return 'unlikelyChange';
  }

  protected getFromParts(id: string): Promise<Art | null> {
    return new ArtDB(firestoreAdmin).getFromParts(id);
  }
}

export const artCache = new ArtCache();
import 'server-only';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
import { LOCAL_CACHE_TAG } from '@/lib/local';

export type CacheLifeValue = Parameters<typeof cacheLife>[0] | 'noChange' | 'unlikelyChange' | 'expectedChangeLowConsequenceIfStale';

export abstract class RootCache<T, TArgs extends readonly unknown[]> {
  protected fsAdmin: FirebaseFirestore.Firestore = firestoreAdmin;

  protected abstract getCacheTag(...args: TArgs): string;

  protected abstract cacheLifeValue(): CacheLifeValue;

  protected asNumber(value: number | string): number {
    const n = typeof value === 'string' ? Number.parseInt(value, 10) : value;
    if (!Number.isFinite(n)) throw new Error(`Invalid numeric value: ${value}`);
    return n;
  }

  protected abstract getFromParts(...args: TArgs): Promise<T | null>;

  public async get(...args: TArgs): Promise<T | null> {
    'use cache';
    const tag = this.getCacheTag(...args);
    const cacheLifeValue = this.cacheLifeValue();
    cacheLife(cacheLifeValue as Parameters<typeof cacheLife>[0]);
    cacheTag(LOCAL_CACHE_TAG);
    cacheTag(tag);
    return await this.getFromParts(...args);
  }

  public async invalidateNow(...args: TArgs): Promise<void> {
    updateTag(this.getCacheTag(...args));
  }

  public async invalidateSoon(...args: TArgs): Promise<void> {
    revalidateTag(this.getCacheTag(...args), 'max');
  }
}

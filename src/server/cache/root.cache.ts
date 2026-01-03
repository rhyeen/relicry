import "server-only";
import { cacheLife, cacheTag, revalidateTag, updateTag } from "next/cache";
import { LOCAL_CACHE_TAG } from "@/lib/local";

export type CacheLifeValue =
  | Parameters<typeof cacheLife>[0]
  | "noChange"
  | "unlikelyChange"
  | "expectedChangeLowConsequenceIfStale";

export type CacheHandle<T, TArgs extends readonly unknown[]> = {
  get: (...args: TArgs) => Promise<T | null>;
  getDataTag: (...args: TArgs) => string;
  getPageTag: (...args: TArgs) => string;
  getMetadataTag: (...args: TArgs) => string;
  invalidateNow: (...args: TArgs) => Promise<void>;
  invalidateSoon: (...args: TArgs) => Promise<void>;
  cacheLifeValue: () => CacheLifeValue;
};

export function asNumber(value: number | string): number {
  return typeof value === "number" ? value : parseInt(value, 10);
}

/**
 * Creates a cached data accessor + tag helpers without using `this` anywhere.
 * This is the most compatible pattern with Next's "use cache" transform.
 */
export function createCache<T, TArgs extends readonly unknown[]>(opts: {
  getCacheTag: (...args: TArgs) => string;
  cacheLifeValue: () => CacheLifeValue;
  getFromParts: (...args: TArgs) => Promise<T | null>;
}): CacheHandle<T, TArgs> {
  const getDataTag = (...args: TArgs) => `d/${opts.getCacheTag(...args)}`;
  const getPageTag = (...args: TArgs) => `p/${opts.getCacheTag(...args)}`;
  const getMetadataTag = (...args: TArgs) => `m/${opts.getCacheTag(...args)}`;

  const get = async (...args: TArgs): Promise<T | null> => {
    "use cache";

    cacheLife(opts.cacheLifeValue() as Parameters<typeof cacheLife>[0]);
    cacheTag(LOCAL_CACHE_TAG);
    cacheTag(getDataTag(...args));

    return await opts.getFromParts(...args);
  };

  const invalidateNow = async (...args: TArgs) => {
    updateTag(getDataTag(...args));
    updateTag(getPageTag(...args));
    updateTag(getMetadataTag(...args));
  };

  const invalidateSoon = async (...args: TArgs) => {
    revalidateTag(getDataTag(...args), "max");
    revalidateTag(getPageTag(...args), "max");
    revalidateTag(getMetadataTag(...args), "max");
  };

  return {
    get,
    getDataTag,
    getPageTag,
    getMetadataTag,
    invalidateNow,
    invalidateSoon,
    cacheLifeValue: opts.cacheLifeValue,
  };
}

// Heralds are vendors or others who handle quest threads or are
// otherwise associated with events in some way, like card artists.

import { generateId } from '@/lib/idGenerator';
import { prefixId, StoredRoot } from './Root';

export type Herald = StoredRoot & {
  // hrd/a1b2c3d4e5
  id: string;
  userId: string;
  artistId: string | null;
  eventId: string;
  override: {
    // Order: override.name || user[userId].displayName
    name?: string;
    // Order: override.profileImageUrl || user[userId].profileImage
    profileImageUrl?: string;
    // Order: override.bannerImageUrl || artist[artistId]?.bannerImageUrl
    bannerImageUrl?: string;
    // Order: override.summary || artist[artistId]?.summary
    summary?: string;
    // Order: override.promotedItemIds || artist[artistId]?.promotedItemIds
    promotedItemIds?: string[];
  };
  mapPin: {
    id: string;
    x: number;
    y: number;
    note?: string;
  };
  limitedTimeAtEvent?: {
    from: Date;
    to: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export function getHeraldId(id: string): string {
  return prefixId('hrd', id);
}

export function generateHeraldId(): string {
  return getHeraldId(generateId(10));
}

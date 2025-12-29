// Heralds are vendors or others who handle quest threads or are
// otherwise associated with events in some way, like card artists.

import { LocaleMap } from './LocaleMap';

export interface Herald {
  // hrd/a1b2c3d4e5
  id: string;
  userId: string;
  artistId: string | null;
  eventId: string;
  override: {
    // Order: override.name || artist[artistId]?.name || user[userId].displayName
    name?: string;
    // Same order as name
    profileImageUrl?: string;
    bannerImageUrl?: string;
    summary?: LocaleMap;
    promotedItemIds?: string[];
  };
  mapPin: {
    id: string;
    x: number;
    y: number;
    note?: LocaleMap;
  };
  limitedTimeAtEvent?: {
    from: Date;
    to: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

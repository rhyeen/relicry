import { LocaleMap } from './LocaleMap';

export interface Artist {
  // @NOTE: We have a distinct Artist ID as an artist may be a team or need to be transfered
  // to a different user.
  id: string;
  userId: string;
  name: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  summary?: LocaleMap;
  promotedArtIds?: string[];
  promotedItemIds?: string[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

import { prefixId, StoredRoot } from './Root';

export type Artist = StoredRoot & {
  // @NOTE: We have a distinct Artist ID as an artist may be a team or need to be transfered
  // to a different user.
  // ast/a1b2c3d4e5
  id: string;
  userId: string;
  name: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  summary?: string;
  promotedArtIds: string[];
  promotedItemIds: string[];
  tags: ArtistTag[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

export enum ArtistTag {
  CardIllustrator = 'card_illustrator',
  CardAuthor = 'card_author',
  Illustrator = 'illustrator',
  Author = 'author',
}

export function getArtistId(id: string): string {
  return prefixId('ast', id);
}

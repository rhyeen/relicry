import { prefixId, StoredRoot } from './Root';
import { ImageSize, ImageStorage } from './Image';

export type Art = IllustrationArt | WritingArt;

export type IllustrationArt = RootArt & StoredRoot & {
  type: 'illustration';
  image: {
    [ImageSize.Card]?: ImageStorage;
    [ImageSize.CardPreview]?: ImageStorage;
    [ImageSize.CardFull]?: ImageStorage;
  };
}

export type WritingArt = RootArt & StoredRoot & {
  type: 'writing';
  markdown: string;
}

export type RootArt = {
  // art/a1b2c3d4e5
  id: string;
  type: 'illustration' | 'writing';
  artistId: string;
  title?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

export function getArtId(id: string): string {
  return prefixId('art', id);
}

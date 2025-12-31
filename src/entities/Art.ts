import { StoredRoot } from './Root';

export type Art = IllustrationArt | WritingArt;

export interface IllustrationArt extends RootArt, StoredRoot {
  type: 'illustration';
  imageUrl: string;
}

export interface WritingArt extends RootArt, StoredRoot {
  type: 'writing';
  markdown: string;
}

export interface RootArt {
  // art/a1b2c3d4e5
  id: string;
  type: 'illustration' | 'writing';
  artistId: string;
  title?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

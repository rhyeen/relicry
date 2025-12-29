import { LocaleMap } from './LocaleMap';

export interface IllustrationArt extends Art {
  type: 'illustration';
  imageUrl: string;
}

export interface WritingArt extends Art {
  type: 'writing';
  markdown: LocaleMap;
}

export interface Art {
  // art/a1b2c3d4e5
  id: string;
  type: 'illustration' | 'writing';
  artistId: string;
  title?: LocaleMap;
  description?: LocaleMap;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

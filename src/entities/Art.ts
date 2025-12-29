import { LocaleMap } from './LocaleMap';

export interface IllustrationArt extends Art {
  type: 'illustration';
  imageUrl: string;
}

export interface WritingArt extends Art {
  type: 'writing';
  markdown: string;
}

export interface Art {
  id: string;
  type: 'illustration' | 'writing';
  artistId: string;
  title?: LocaleMap;
  description?: LocaleMap;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

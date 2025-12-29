import { Aspect } from './Aspect';
import { CardEffect } from './CardEffect';
import { FlavorText } from './FlavorText';
import { LocaleMap } from './LocaleMap';
import { Rarity } from './Rarity';
import { Tag } from './Tag';

export interface VersionedGambitCard extends GambitCard, Version {}

export interface VersionedDeckCard extends DeckCard, Version {}

export interface VersionedFocusCard extends FocusCard, Version {
  awakenedVersion: {
    illustration?: {
      artId: string;
      artistId: string;
    };
    flavorText?: FlavorText;
  }
}

export interface Version {
  version: number;
  season: number;
  illustration: {
    artId: string;
    artistId: string;
  };
  flavorText?: FlavorText;
  subTitle?: LocaleMap;
  revealedAt: Date;
  revealedContext: LocaleMap;
  publishedAt: Date | null;
  publishedContext?: LocaleMap;
  archivedAt: Date | null;
  archivedContext?: LocaleMap;
  // @NOTE: A sample card is never intended to be released to the public and may use AI-generated assets
  isSample: boolean;
}

export interface DeckCard extends Card {
  type: 'deck';
  drawLimit: number;
  scrapCost: (Aspect | [Aspect, Aspect])[];
  aspect: Aspect | [Aspect, Aspect];
}

export interface FocusCard extends Card {
  type: 'focus';
  aspect: Aspect | [Aspect, Aspect];
  awakened: RootCard;
}

export interface GambitCard extends Card {
  type: 'gambit';
}

export interface Card extends RootCard {
  // a1b2c3
  id: string;
  type: 'deck' | 'focus' | 'gambit';
  title: LocaleMap;
  rarity: Rarity;
}

export interface RootCard {
  title?: LocaleMap;
  tags: Tag[];
  effects: CardEffect[];
}

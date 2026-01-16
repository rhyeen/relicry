import { Aspect } from './Aspect';
import { CardEffect } from './CardEffect';
import { FlavorText } from './FlavorText';
import { Rarity } from './Rarity';
import { prefixId, StoredRoot } from './Root';
import { Tag } from './Tag';

export type VersionedCard = VersionedDeckCard | VersionedFocusCard | VersionedGambitCard;

export type VersionedGambitCard = GambitCard & Version & StoredRoot;

export type VersionedDeckCard = DeckCard & Version & StoredRoot;

export type VersionedFocusCard = FocusCard & Version & StoredRoot & {
  awakenedVersion: {
    illustration?: {
      artId: string;
      artistId: string;
    };
    flavorText?: FlavorText;
  }
};

export type Version = {
  version: number;
  season: number;
  // @NOTE: When looking at the list of cards, this is the one that should be shown.
  // There should only ever be one "isFeatured".
  isFeatured: boolean;
  illustration: {
    artId: string;
    artistId: string;
  };
  flavorText?: FlavorText;
  subTitle?: string;
  revealedAt: Date;
  revealedContext?: string;
  publishedAt: Date | null;
  publishedContext?: string;
  archivedAt: Date | null;
  archivedContext?: string;
  // @NOTE: A sample card is never intended to be released to the public and may use AI-generated assets
  isSample: boolean;
}

export type DeckCard = Card & {
  type: 'deck';
  drawLimit: number;
  scrapCost: (Aspect | [Aspect, Aspect])[];
  aspect: Aspect | [Aspect, Aspect];
}

export type FocusCard = Card & {
  type: 'focus';
  aspect: Aspect | [Aspect, Aspect];
  awakened: RootCard;
}

export type GambitCard = Card & {
  type: 'gambit';
}

export type Card = RootCard & {
  // c/a1b2
  id: string;
  type: 'deck' | 'focus' | 'gambit';
  title: string;
  rarity: Rarity;
}

export type RootCard = {
  title?: string;
  tags: Tag[];
  effects: CardEffect[];
}

export function getCardId(id: string): string {
  return prefixId('c', id);
}

export function getCardDocId(id: string, version: number): string {
  return `${getCardId(id)}/${version}`;
}
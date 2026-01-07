import { Aspect } from './Aspect';
import { CardEffect } from './CardEffect';
import { FlavorText } from './FlavorText';
import { Rarity } from './Rarity';
import { prefixId, StoredRoot } from './Root';
import { Tag } from './Tag';

export type VersionedCard = VersionedDeckCard | VersionedFocusCard | VersionedGambitCard;

export interface VersionedGambitCard extends GambitCard, Version, StoredRoot {}

export interface VersionedDeckCard extends DeckCard, Version, StoredRoot {}

export interface VersionedFocusCard extends FocusCard, Version, StoredRoot {
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
  // c/a1b2
  id: string;
  type: 'deck' | 'focus' | 'gambit';
  title: string;
  rarity: Rarity;
}

export interface RootCard {
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
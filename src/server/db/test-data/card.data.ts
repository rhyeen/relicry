import { Aspect } from '@/entities/Aspect';
import { Version, VersionedDeckCard, VersionedFocusCard } from '@/entities/Card';
import { CardEffectPartText, CardEffectPartDamage, CardEffectPartCard, CardEffect, CardEffectPartQuell, CardEffectPart } from '@/entities/CardEffect';
import { Conditional } from '@/entities/Conditional';
import { Rarity } from '@/entities/Rarity';
import { Tag } from '@/entities/Tag';
import { artTestIds } from './art.data';
import { artistTestIds } from './artist.data';

export const cardTestIds = {
  deckCard1: '0001',
  deckCard2: '0002',
  focusCard3: '0003',
}

function defaultVersion(artId?: string, artistId?: string): Version {
  return {
    version: 1,
    season: 1,
    illustration: {
      artId: artId ?? artTestIds.illustrationArt1,
      artistId: artistId ?? artistTestIds.artist1,
    },
    revealedAt: new Date(),
    publishedAt: new Date(),
    archivedAt: null,
    isSample: true,
    isFeatured: true,
  };
}

export function getExampleCard1(): VersionedDeckCard {
  return {
    id: cardTestIds.deckCard1,
    type: 'deck',
    title: 'Deck Card 1',
    rarity: Rarity.Common,
    tags: [Tag.Item, Tag.Weapon, Tag.Blade],
    effects: [dealXDamage(2)],
    drawLimit: 3,
    scrapCost: [],
    aspect: Aspect.Brave,
    ...defaultVersion(artTestIds.illustrationArt1, artistTestIds.artist1),
  };
}

export function getExampleCard2(): VersionedDeckCard {
  return {
    id: cardTestIds.deckCard2,
    type: 'deck',
    title: 'Deck Card 2',
    subTitle: 'The Epic Card of Awesomeness',
    rarity: Rarity.Epic,
    tags: [Tag.Ability, Tag.Bling],
    effects: [
      {
        ...drawXCards(1, quellX(1, forEachAspect(Aspect.Brave).parts).parts),
        conditionals: [Conditional.TurnEnd],
        // aura: 3,
      },
      ifXCardsPlayed(3, true, ifScrapped(dealXDamage(1, thenFlip().parts).parts).parts),
    ],
    drawLimit: 5,
    scrapCost: [
      Aspect.Cunning, [ Aspect.Charming, Aspect.Brave ],
    ],
    flavorText: {
      onCard: { text: 'A really valuable card with mysterious powers that only the chosen can wield.', source: 'Ancient Lore' },
      extended: null,
    },
    aspect: [ Aspect.Charming, Aspect.Cunning ],
    ...defaultVersion(artTestIds.illustrationArt2, artistTestIds.artist2),
  };
}

export function getExampleCard3(): VersionedFocusCard {
  return {
    id: cardTestIds.focusCard3,
    type: 'focus',
    title: 'Focus Card 3',
    rarity: Rarity.Rare,
    tags: [Tag.Focus],
    effects: [
      {
        conditionals: [Conditional.Infinite],
        parts: [
          { type: 'text', text: 'If you have' } as CardEffectPartText,
          { type: 'card', amount: 3, orMore: true } as CardEffectPartCard,
          { type: 'text', text: ',' } as CardEffectPartText,
          { type: 'flip' },
        ],
      },
    ],
    awakenedVersion: {
      flavorText: {
        onCard: { text: 'Awakened focus flavor text.' },
        extended: {
          artId: artTestIds.writingArt4,
          artistId: artistTestIds.artist3,
        },
      },
    },
    awakened: {
      tags: [Tag.Focus, Tag.Favor],
      effects: [drawXCards(5)],
    },
    aspect: Aspect.Cunning,
    ...defaultVersion(artTestIds.illustrationArt3, artistTestIds.artist3),
  };
}

function drawXCards(x: number, additionalParts?: CardEffectPart[]): CardEffect {
  return {
    conditionals: [],
    parts: [
      { type: 'text', text: 'Draw' } as CardEffectPartText,
      { type: 'card', amount: x } as CardEffectPartCard,
      ...(additionalParts ?? []),
    ],
  };
}

function ifScrapped(additionalParts: CardEffectPart[]): CardEffect {
  return {
    conditionals: [],
    parts: [
      { type: 'text', text: 'If this card is' } as CardEffectPartText,
      { type: 'scrapped' },
      ...additionalParts,
    ],
  };
}

function forEachAspect(aspect: Aspect, additionalParts?: CardEffectPart[]): CardEffect {
  return {
    conditionals: [],
    parts: [
      { type: 'text', text: 'for each' } as CardEffectPartText,
      { type: 'aspect', aspect } as CardEffectPart,
      ...(additionalParts ?? []),
      { type: 'text', text: '.' } as CardEffectPartText,
    ],
  };
}

function ifXCardsPlayed(x: number, orMore: boolean, additionalParts: CardEffectPart[]): CardEffect {
  return {
    conditionals: [],
    parts: [
      { type: 'text', text: 'If played' } as CardEffectPartText,
      { type: 'card', amount: x, orMore } as CardEffectPartCard,
      ...additionalParts,
    ],
  };
}

function thenFlip(additionalParts?: CardEffectPart[]): CardEffect {
  return {
    conditionals: [],
    parts: [
      { type: 'text', text: ',' } as CardEffectPartText,
      { type: 'flip' },
      ...(additionalParts ?? []),
      { type: 'text', text: '.' } as CardEffectPartText,
    ],
  };
}

function dealXDamage(x: number, additionalParts?: CardEffectPart[]): CardEffect {
  return {
    conditionals: [],
    parts: [
      { type: 'text', text: 'Deal' } as CardEffectPartText,
      { type: 'damage', amount: x } as CardEffectPartDamage,
      ...(additionalParts ?? []),
    ],
  };
}

function quellX(x: number, additionalParts?: CardEffectPart[]): CardEffect {
  return {
    conditionals: [],
    parts: [
      { type: 'text', text: 'Quell' } as CardEffectPartText,
      { type: 'quell', amount: x } as CardEffectPartQuell,
      ...(additionalParts ?? []),
    ],
  };
}
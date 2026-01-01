import { Aspect } from '@/entities/Aspect';
import { Version, VersionedDeckCard, VersionedFocusCard } from '@/entities/Card';
import { CardEffectPartText, CardEffectPartDamage, CardEffectPartCard, CardEffect } from '@/entities/CardEffect';
import { Conditional } from '@/entities/Conditional';
import { Rarity } from '@/entities/Rarity';
import { Tag } from '@/entities/Tag';
import { artTestIds } from './art.data';
import { artistTestIds } from './artist.data';

export const cardTestIds = {
  deckCard1: '1111',
  deckCard2: '1112',
  focusCard3: '1113',
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
  };
}

export function getExampleCard1(): VersionedDeckCard {
  return {
    id: cardTestIds.deckCard1,
    type: 'deck',
    title: 'Deck Card 1',
    rarity: Rarity.Common,
    tags: [Tag.Item, Tag.Weapon, Tag.Blade],
    effects: dealXDamage(2),
    drawLimit: 3,
    scrapCost: [Aspect.Brave],
    aspect: Aspect.Brave,
    ...defaultVersion(artTestIds.illustrationArt1, artistTestIds.artist1),
  };
}

export function getExampleCard2(): VersionedDeckCard {
  return {
    id: cardTestIds.deckCard2,
    type: 'deck',
    title: 'Deck Card 2',
    rarity: Rarity.Legendary,
    tags: [Tag.Ability, Tag.Bling],
    effects: drawXCards(3),
    drawLimit: 5,
    scrapCost: [],
    aspect: Aspect.Charming,
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
          { type: 'text', text: 'If you have ' } as CardEffectPartText,
          { type: 'card', amount: 3, orMore: true } as CardEffectPartCard,
          { type: 'text', text: ', ' } as CardEffectPartText,
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
      effects: drawXCards(5),
    },
    aspect: Aspect.Cunning,
    ...defaultVersion(artTestIds.illustrationArt3, artistTestIds.artist3),
  };
}

function drawXCards(x: number): CardEffect[] {
  return [
    {
      conditionals: [],
      parts: [
        { type: 'text', text: 'Draw ' } as CardEffectPartText,
        { type: 'card', amount: x } as CardEffectPartCard,
      ],
    },
  ];
}

function dealXDamage(x: number): CardEffect[] {
  return [
    {
      conditionals: [],
      parts: [
        { type: 'text', text: 'Deal ' } as CardEffectPartText,
        { type: 'damage', amount: x } as CardEffectPartDamage,
      ],
    },
  ];
}
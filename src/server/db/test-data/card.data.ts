import { Aspect } from '@/entities/Aspect';
import { Version, VersionedCard, VersionedDeckCard, VersionedFocusCard, VersionedGambitCard } from '@/entities/Card';
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

const generatedArtIds = [
  artTestIds.illustrationArt1,
  artTestIds.illustrationArt2,
  artTestIds.illustrationArt3,
];

const generatedArtistIds = [
  artistTestIds.artist1,
  artistTestIds.artist2,
  artistTestIds.artist3,
];

const generatedSingleAspects = [
  Aspect.Brave,
  Aspect.Cunning,
  Aspect.Wise,
  Aspect.Charming,
];

const generatedDualAspects: [Aspect, Aspect][] = [
  [Aspect.Brave, Aspect.Cunning],
  [Aspect.Brave, Aspect.Wise],
  [Aspect.Cunning, Aspect.Wise],
  [Aspect.Wise, Aspect.Charming],
  [Aspect.Charming, Aspect.Brave],
  [Aspect.Charming, Aspect.Cunning],
];

const generatedRarities = [
  Rarity.Common,
  Rarity.Rare,
  Rarity.Epic,
  Rarity.Legendary,
];

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

function generatedVersion(index: number): Version {
  const artIndex = (index - 1) % generatedArtIds.length;
  const date = new Date(Date.UTC(2026, 0, 1, 12, index));

  return {
    ...defaultVersion(generatedArtIds[artIndex], generatedArtistIds[artIndex]),
    revealedAt: date,
    publishedAt: date,
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

export function getGeneratedLocalCardId(index: number): string {
  return `local-${String(index).padStart(4, '0')}`;
}

export function getGeneratedExampleCard(index: number): VersionedCard {
  const cycle = index % 3;

  if (cycle === 1) {
    return getGeneratedDeckCard(index);
  }

  if (cycle === 2) {
    return getGeneratedFocusCard(index);
  }

  return getGeneratedGambitCard(index);
}

function getGeneratedDeckCard(index: number): VersionedDeckCard {
  const rarity = generatedRarities[(index - 1) % generatedRarities.length];
  const singleAspect = generatedSingleAspects[(index - 1) % generatedSingleAspects.length];
  const dualAspect = generatedDualAspects[(index - 1) % generatedDualAspects.length];
  const useDualAspect = index % 4 === 0;

  return {
    id: getGeneratedLocalCardId(index),
    type: 'deck',
    title: `Example Card ${index}`,
    subTitle: getGeneratedSubtitle(index, rarity),
    rarity,
    tags: [Tag.Item, useDualAspect ? Tag.Bling : Tag.Weapon],
    effects: [dealXDamage((index % 5) + 1)],
    drawLimit: (index % 4) + 1,
    scrapCost: useDualAspect ? [dualAspect, singleAspect] : [singleAspect],
    aspect: useDualAspect ? dualAspect : singleAspect,
    ...generatedVersion(index),
  };
}

function getGeneratedFocusCard(index: number): VersionedFocusCard {
  const rarity = generatedRarities[(index - 1) % generatedRarities.length];
  const aspect = generatedSingleAspects[(index - 1) % generatedSingleAspects.length];

  return {
    id: getGeneratedLocalCardId(index),
    type: 'focus',
    title: `Example Card ${index}`,
    subTitle: getGeneratedSubtitle(index, rarity),
    rarity,
    tags: [Tag.Focus],
    effects: [drawXCards((index % 3) + 1)],
    awakenedVersion: {
      flavorText: {
        onCard: { text: `Awakened Example Card ${index}.` },
        extended: null,
      },
    },
    awakened: {
      tags: [Tag.Focus, Tag.Favor],
      effects: [quellX((index % 3) + 1)],
    },
    aspect,
    ...generatedVersion(index),
  };
}

function getGeneratedGambitCard(index: number): VersionedGambitCard {
  const rarity = generatedRarities[(index - 1) % generatedRarities.length];

  return {
    id: getGeneratedLocalCardId(index),
    type: 'gambit',
    title: `Example Card ${index}`,
    subTitle: getGeneratedSubtitle(index, rarity),
    rarity,
    tags: [Tag.Gambit],
    effects: [dealXDamage((index % 4) + 1, quellX((index % 2) + 1).parts)],
    ...generatedVersion(index),
  };
}

function getGeneratedSubtitle(index: number, rarity: Rarity): string | undefined {
  if (rarity === Rarity.Epic || rarity === Rarity.Legendary) {
    return `Autogenerated sample ${index}`;
  }
  return undefined;
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

import { describe, expect, it } from 'vitest';
import { Aspect } from '@/entities/Aspect';
import { Rarity } from '@/entities/Rarity';
import { VersionedCard } from '@/entities/Card';
import {
  buildCardsQueryString,
  CARDS_PAGE_SIZE,
  filterAndPaginateCards,
  parseCardsFilters,
} from './cardsList';

function buildDeckCard(overrides: Partial<VersionedCard> = {}): VersionedCard {
  return {
    id: 'c/test',
    type: 'deck',
    title: 'Brave Strike',
    rarity: Rarity.Common,
    drawLimit: 1,
    scrapCost: [Aspect.Brave],
    aspect: Aspect.Brave,
    tags: [],
    effects: [],
    version: 1,
    season: 1,
    isFeatured: true,
    illustration: {
      artId: 'a/test',
      artistId: 'a/artist',
    },
    revealedAt: new Date('2026-01-01'),
    publishedAt: null,
    archivedAt: null,
    isSample: false,
    ...overrides,
  } as VersionedCard;
}

describe('parseCardsFilters', () => {
  it('normalizes unexpected values to defaults', () => {
    expect(parseCardsFilters({
      page: '0',
      type: 'unknown',
      aspect: 'gambit',
      query: '  Brave  ',
    })).toEqual({
      page: 1,
      type: 'all',
      aspect: 'all',
      query: 'Brave',
    });
  });
});

describe('filterAndPaginateCards', () => {
  const cards = [
    buildDeckCard(),
    buildDeckCard({
      id: 'c/focus',
      type: 'focus',
      title: 'Wise Focus',
      aspect: Aspect.Wise,
      awakened: {
        tags: [],
        effects: [],
      },
      awakenedVersion: {},
    }),
    buildDeckCard({
      id: 'c/gambit',
      type: 'gambit',
      title: 'Clever Gambit',
    }),
    buildDeckCard({
      id: 'c/dual',
      title: 'Twin Edge',
      aspect: [Aspect.Brave, Aspect.Cunning],
      scrapCost: [[Aspect.Brave, Aspect.Cunning]],
    }),
  ];

  it('filters by title query, type, and aspect', () => {
    const result = filterAndPaginateCards(cards, {
      page: 1,
      query: 'focus',
      type: 'focus',
      aspect: Aspect.Wise,
    });

    expect(result.totalCards).toBe(1);
    expect(result.cards.map((card) => card.title)).toEqual(['Wise Focus']);
  });

  it('matches dual-aspect cards with the dual filter', () => {
    const result = filterAndPaginateCards(cards, {
      page: 1,
      query: '',
      type: 'all',
      aspect: 'dual',
    });

    expect(result.cards.map((card) => card.title)).toEqual(['Twin Edge']);
  });

  it('clamps page numbers after filtering', () => {
    const manyCards = Array.from({ length: CARDS_PAGE_SIZE + 1 }, (_, index) =>
      buildDeckCard({
        id: `c/${index}`,
        title: `Card ${index + 1}`,
      })
    );

    const result = filterAndPaginateCards(manyCards, {
      page: 3,
      query: '',
      type: 'all',
      aspect: 'all',
    });

    expect(result.page).toBe(2);
    expect(result.cards).toHaveLength(1);
  });
});

describe('buildCardsQueryString', () => {
  it('omits default filters from the query string', () => {
    expect(buildCardsQueryString({
      query: ' Brave ',
      type: 'all',
      aspect: 'all',
      page: 1,
    })).toBe('?query=Brave');
  });
});

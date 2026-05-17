import { describe, expect, it } from 'vitest';
import {
  buildCardsQueryString,
  buildCollectionQueryString,
  getCardsPageNumber,
  parseCollectionFilters,
  parseCardsFilters,
} from './cardsList';

describe('parseCardsFilters', () => {
  it('normalizes unexpected values to defaults', () => {
    expect(parseCardsFilters({
      type: 'unknown',
      aspect: 'gambit',
      query: '  Brave  ',
      cursor: 'cursor-1',
      history: '__root__,cursor-0',
    })).toEqual({
      type: 'all',
      aspect: 'all',
      query: 'Brave',
      cursor: 'cursor-1',
      history: [null, 'cursor-0'],
    });
  });
});

describe('parseCollectionFilters', () => {
  it('defaults to the signed-in player collection', () => {
    expect(parseCollectionFilters({ scope: 'unexpected' }).scope).toBe('collection');
  });

  it('accepts the all-cards scope', () => {
    expect(parseCollectionFilters({ scope: 'all', query: 'Deck' })).toMatchObject({
      scope: 'all',
      query: 'Deck',
    });
  });
});

describe('getCardsPageNumber', () => {
  it('derives the page number from cursor history', () => {
    expect(getCardsPageNumber({
      query: '',
      type: 'all',
      aspect: 'all',
      cursor: 'cursor-2',
      history: [null, 'cursor-1'],
    })).toBe(3);
  });
});

describe('buildCollectionQueryString', () => {
  it('omits the default collection scope', () => {
    expect(buildCollectionQueryString({
      scope: 'collection',
      query: 'Deck',
    })).toBe('?query=Deck');
  });

  it('serializes all-cards scope with regular card filters', () => {
    expect(buildCollectionQueryString({
      scope: 'all',
      type: 'focus',
    })).toBe('?type=focus&scope=all');
  });
});

describe('buildCardsQueryString', () => {
  it('omits default filters from the query string', () => {
    expect(buildCardsQueryString({
      query: ' Brave ',
      type: 'all',
      aspect: 'all',
    })).toBe('?query=Brave');
  });

  it('serializes cursor history', () => {
    expect(buildCardsQueryString({
      cursor: 'cursor-2',
      history: [null, 'cursor-1'],
    })).toBe('?cursor=cursor-2&history=__root__%2Ccursor-1');
  });
});

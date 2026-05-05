import { describe, expect, it } from 'vitest';
import {
  buildCardsQueryString,
  getCardsPageNumber,
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

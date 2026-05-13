import { describe, expect, it } from 'vitest';

import {
  buildArtQueryString,
  normalizeArtSearchText,
  parseArtFilters,
  parseArtSearchQuery,
} from './artList';

describe('art list filters', () => {
  it('parses supported filters from search params', () => {
    expect(parseArtFilters(new URLSearchParams('query=Nano&type=illustration&generation=ai'))).toEqual({
      query: 'Nano',
      type: 'illustration',
      generation: 'ai',
      cursor: null,
      history: [],
    });
  });

  it('serializes only active filters and pagination state', () => {
    expect(buildArtQueryString({
      query: ' Nano Banana ',
      type: 'all',
      generation: 'original',
      cursor: 'cursor-token',
      history: [null, 'previous-token'],
    })).toBe('?query=Nano+Banana&generation=original&cursor=cursor-token&history=__root__%2Cprevious-token');
  });
});

describe('parseArtSearchQuery', () => {
  it('treats a prefixed art id as an id-only search', () => {
    expect(parseArtSearchQuery(' art/kit9quwr2g ')).toEqual({
      artIds: ['art/kit9quwr2g'],
      artistIds: [],
      idOnly: true,
      normalizedText: '',
    });
  });

  it('treats a prefixed artist id as an id-only search', () => {
    expect(parseArtSearchQuery('ast/sbgv1mxyml')).toEqual({
      artIds: [],
      artistIds: ['ast/sbgv1mxyml'],
      idOnly: true,
      normalizedText: '',
    });
  });

  it('combines bare art and artist id candidates with normal text search', () => {
    expect(parseArtSearchQuery('kit9quwr2g')).toEqual({
      artIds: ['art/kit9quwr2g'],
      artistIds: ['ast/kit9quwr2g'],
      idOnly: false,
      normalizedText: 'kit9quwr2g',
    });
  });
});

describe('normalizeArtSearchText', () => {
  it('normalizes spacing, punctuation, and case', () => {
    expect(normalizeArtSearchText('  Nano-Banana!!!  ')).toBe('nano banana');
  });
});

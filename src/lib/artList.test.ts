import { describe, expect, it } from 'vitest';

import {
  buildArtQueryString,
  normalizeArtSearchText,
  parseArtFilters,
  parseArtSearchQuery,
} from './artList';

describe('art list filters', () => {
  it('parses supported filters from search params', () => {
    expect(parseArtFilters(new URLSearchParams('query=Nano&artistId=sbgv1mxyml&type=illustration&generation=ai&page=3'))).toEqual({
      query: 'Nano',
      artistId: 'ast/sbgv1mxyml',
      type: 'illustration',
      generation: 'ai',
      page: 3,
    });
  });

  it('defaults invalid pages to page 1', () => {
    expect(parseArtFilters(new URLSearchParams('page=-2'))).toEqual({
      query: '',
      artistId: '',
      type: 'all',
      generation: 'all',
      page: 1,
    });
  });

  it('serializes only active filters and page state', () => {
    expect(buildArtQueryString({
      query: ' Nano Banana ',
      artistId: 'ast/sbgv1mxyml',
      type: 'all',
      generation: 'original',
      page: 4,
    })).toBe('?query=Nano+Banana&artistId=ast%2Fsbgv1mxyml&generation=original&page=4');
  });

  it('omits page 1 from serialized filters', () => {
    expect(buildArtQueryString({
      page: 1,
    })).toBe('');
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

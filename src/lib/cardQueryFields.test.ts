import { describe, expect, it } from 'vitest';

import { Aspect } from '@/entities/Aspect';
import {
  buildAspectFilterKeys,
  buildCardAspectKey,
  buildCardTitlePrefixes,
  decodeCardsHistoryEntry,
  encodeCardsHistoryEntry,
  normalizeCardTitleQuery,
  parseCardSearchQuery,
} from './cardQueryFields';

describe('normalizeCardTitleQuery', () => {
  it('normalizes spacing, punctuation, and case', () => {
    expect(normalizeCardTitleQuery('  Wise-Focus!!!  ')).toBe('wise focus');
  });
});

describe('buildCardTitlePrefixes', () => {
  it('supports prefix matches from any word boundary', () => {
    const prefixes = buildCardTitlePrefixes('Wise Focus');

    expect(prefixes).toContain('w');
    expect(prefixes).toContain('wise');
    expect(prefixes).toContain('wise f');
    expect(prefixes).toContain('focus');
    expect(prefixes).toContain('fo');
  });
});

describe('parseCardSearchQuery', () => {
  it('treats a prefixed card id as an id-only search', () => {
    expect(parseCardSearchQuery(' c/zq1w ')).toEqual({
      cardIds: ['c/zq1w'],
      idOnly: true,
      normalizedTitle: '',
    });
  });

  it('combines bare card id candidates with normal title search', () => {
    expect(parseCardSearchQuery('zq1w')).toEqual({
      cardIds: ['c/zq1w'],
      idOnly: false,
      normalizedTitle: 'zq1w',
    });
  });
});

describe('buildCardAspectKey', () => {
  it('stores dual aspects in a canonical order', () => {
    expect(buildCardAspectKey([Aspect.Charming, Aspect.Brave])).toBe('brave+charming');
  });
});

describe('buildAspectFilterKeys', () => {
  it('returns all matching single and dual keys for a specific aspect', () => {
    expect(buildAspectFilterKeys(Aspect.Brave)).toEqual([
      'brave',
      'brave+cunning',
      'brave+wise',
      'brave+charming',
    ]);
  });

  it('returns all dual-aspect keys for the dual filter', () => {
    expect(buildAspectFilterKeys('dual')).toHaveLength(6);
  });
});

describe('cards history encoding', () => {
  it('round-trips the root cursor sentinel', () => {
    expect(decodeCardsHistoryEntry(encodeCardsHistoryEntry(null))).toBeNull();
    expect(decodeCardsHistoryEntry(encodeCardsHistoryEntry('cursor-token'))).toBe('cursor-token');
  });
});

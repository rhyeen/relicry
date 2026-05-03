import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCAL_CARD_COUNT,
  MAX_LOCAL_CARD_COUNT,
  normalizeLocalCardCount,
} from './localPopulate';

describe('normalizeLocalCardCount', () => {
  it('falls back to the default minimum when the input is missing or invalid', () => {
    expect(normalizeLocalCardCount(undefined)).toBe(DEFAULT_LOCAL_CARD_COUNT);
    expect(normalizeLocalCardCount('')).toBe(DEFAULT_LOCAL_CARD_COUNT);
    expect(normalizeLocalCardCount('abc')).toBe(DEFAULT_LOCAL_CARD_COUNT);
  });

  it('enforces the minimum count', () => {
    expect(normalizeLocalCardCount(0)).toBe(DEFAULT_LOCAL_CARD_COUNT);
    expect(normalizeLocalCardCount(2)).toBe(DEFAULT_LOCAL_CARD_COUNT);
  });

  it('accepts a valid requested count', () => {
    expect(normalizeLocalCardCount('42')).toBe(42);
  });

  it('caps the count at the supported maximum', () => {
    expect(normalizeLocalCardCount(MAX_LOCAL_CARD_COUNT + 200)).toBe(MAX_LOCAL_CARD_COUNT);
  });
});

import { describe, expect, it } from 'vitest';
import { hasAttachedPunctuation } from './punctuation';

describe('hasAttachedPunctuation', () => {
  it('returns false for empty text', () => {
    expect(hasAttachedPunctuation('')).toBe(false);
  });

  it('returns false when punctuation is preceded by whitespace', () => {
    expect(hasAttachedPunctuation(' "')).toBe(false);
    expect(hasAttachedPunctuation('Deal 3D &')).toBe(false);
  });

  it('returns true when punctuation is attached to the prior character', () => {
    expect(hasAttachedPunctuation('D"')).toBe(true);
    expect(hasAttachedPunctuation('Deal 3D&')).toBe(true);
    expect(hasAttachedPunctuation('Deal *D&')).toBe(true);
  });

  it('returns true when text starts with punctuation', () => {
    expect(hasAttachedPunctuation('"Deal')).toBe(true);
    expect(hasAttachedPunctuation(',')).toBe(true);
  });
});


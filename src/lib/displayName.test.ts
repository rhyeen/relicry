import { describe, expect, test } from 'vitest';
import {
  countDisplayNameLetters,
  getDisplayNameValidationError,
  normalizeDisplayName,
} from './displayName';

describe('displayName', () => {
  test('trims display names', () => {
    expect(normalizeDisplayName('  CJ  ')).toBe('CJ');
  });

  test('counts letters through punctuation and symbols', () => {
    expect(countDisplayNameLetters('CJ')).toBe(2);
    expect(countDisplayNameLetters('c.j.')).toBe(2);
    expect(countDisplayNameLetters('123123cj^&Vb')).toBe(4);
  });

  test('requires at least two letters', () => {
    expect(getDisplayNameValidationError('C')).toBe('Display name must contain at least 2 letters.');
    expect(getDisplayNameValidationError('  123 !  ')).toBe('Display name must contain at least 2 letters.');
    expect(getDisplayNameValidationError(' c.j. ')).toBeNull();
  });
});

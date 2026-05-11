import { describe, expect, test } from 'vitest';
import {
  ACTIVE_EVENT_DURATION_MS,
  getStarterDeckHeading,
  isActiveEventCurrent,
  normalizeActiveEvent,
  normalizeStarterDeckFocusCardIds,
  normalizeStarterObtainedMap,
} from './starterDecks';

describe('starter deck helpers', () => {
  test('normalizes missing legacy user starter fields', () => {
    expect(normalizeStarterObtainedMap(undefined)).toEqual({});
    expect(normalizeActiveEvent(undefined)).toBeNull();
  });

  test('normalizes starter maps and dates', () => {
    const starters = normalizeStarterObtainedMap({
      'c/abcd': {
        obtainedAt: '2026-05-10T12:00:00.000Z',
        obtainedBy: 'u/admin',
        atEventId: 'e/event',
      },
    });

    expect(starters['c/abcd']).toMatchObject({
      id: 'c/abcd',
      obtainedBy: 'u/admin',
      atEventId: 'e/event',
    });
    expect(starters['c/abcd']?.obtainedAt).toBeInstanceOf(Date);
  });

  test('expires active event check-ins after 16 hours', () => {
    const now = new Date('2026-05-10T20:00:00.000Z');
    expect(isActiveEventCurrent({
      id: 'e/event',
      checkedInAt: new Date(now.getTime() - ACTIVE_EVENT_DURATION_MS + 1),
    }, now)).toBe(true);
    expect(isActiveEventCurrent({
      id: 'e/event',
      checkedInAt: new Date(now.getTime() - ACTIVE_EVENT_DURATION_MS),
    }, now)).toBe(false);
  });

  test('deduplicates curated starter focus IDs', () => {
    expect(normalizeStarterDeckFocusCardIds(['c/one', 'c/one', '', null])).toEqual(['c/one']);
  });

  test('uses singular and plural starter headings', () => {
    expect(getStarterDeckHeading(1)).toBe('Starter deck obtained');
    expect(getStarterDeckHeading(0)).toBe('Starter decks obtained');
    expect(getStarterDeckHeading(2)).toBe('Starter decks obtained');
  });
});

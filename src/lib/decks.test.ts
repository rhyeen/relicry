import { describe, expect, test } from 'vitest';
import { getDeckHref, getDeckRouteId, LATEST_DECK_STORAGE_KEY } from './decksApi';
import { getExampleDeck1, getExampleDeck2 } from '@/server/db/test-data/deck.data';
import { userTestIds } from '@/server/db/test-data/user.data';

describe('deck helpers and local seed data', () => {
  test('builds route-safe deck links from stored deck IDs', () => {
    expect(getDeckRouteId('dk/abc123')).toBe('abc123');
    expect(getDeckRouteId('abc123')).toBe('abc123');
    expect(getDeckHref('dk/abc123')).toBe('/dk/abc123');
    expect(LATEST_DECK_STORAGE_KEY).toBe('relicry.latestDeckId');
  });

  test('seeds Test User 1 with multiple playable decks', () => {
    const deck1 = getExampleDeck1();
    const deck2 = getExampleDeck2();

    expect(deck1.userId).toBe(userTestIds.user1);
    expect(deck2.userId).toBe(userTestIds.user1);
    expect(deck1.cardPathIds.length).toBeGreaterThan(1);
    expect(deck2.cardPathIds.length).toBeGreaterThan(1);
    expect(deck1.cardPathIds.every((cardPathId) => /^c\/[A-Za-z0-9]+\/[1-9]\d*$/.test(cardPathId))).toBe(true);
  });
});

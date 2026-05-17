import { VersionedDeck } from '@/entities/Deck';
import { getCardDocId } from '@/entities/Card';
import { cardTestIds } from './card.data';
import { userTestIds } from './user.data';

export const deckTestIds = {
  deck1: 'dk/0000000001',
  deck2: 'dk/0000000002',
  deck3: 'dk/0000000003',
}

function defaultDeck(id: string, name: string, userId: string): VersionedDeck {
  return {
    id,
    version: 1,
    cardPathIds: [],
    userId,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
    isLatest: true,
  };
}

export function getExampleDeck1() {
  return {
    ...defaultDeck(deckTestIds.deck1, 'Brave Starter Build', userTestIds.user1),
    cardPathIds: [
      getCardDocId(cardTestIds.deckCard1, 1),
      getCardDocId(cardTestIds.deckCard1, 1),
      getCardDocId(cardTestIds.deckCard2, 1),
      getCardDocId(cardTestIds.focusCard3, 1),
    ],
  };
}

export function getExampleDeck2() {
  return {
    ...defaultDeck(deckTestIds.deck2, 'Focus Test Deck', userTestIds.user1),
    cardPathIds: [
      getCardDocId(cardTestIds.focusCard3, 1),
      getCardDocId(cardTestIds.deckCard2, 1),
    ],
  };
}

export function getExampleDeck3() {
  return {
    ...defaultDeck(deckTestIds.deck3, 'Example Deck 3', userTestIds.user3),
  };
}

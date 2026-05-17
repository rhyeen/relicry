import type { VersionedDeck } from '@/entities/Deck';
import type { CardPreviewListItem } from '@/lib/cardsApi';
import type { SerializeDates } from '@/lib/serialization';

export const LATEST_DECK_STORAGE_KEY = 'relicry.latestDeckId';

export function getDeckRouteId(deckId: string): string {
  return deckId.startsWith('dk/') ? deckId.slice(3) : deckId;
}

export function getDeckHref(deckId: string): string {
  return `/dk/${getDeckRouteId(deckId)}`;
}

export type DeckDTO = SerializeDates<VersionedDeck>;

export type DeckCardEntryDTO = {
  cardPathId: string;
  cardId: string;
  cardVersion: number;
  count: number;
  preview: CardPreviewListItem;
};

export type DeckListItemDTO = {
  deck: DeckDTO;
  cardCount: number;
  uniqueCardCount: number;
  previews: CardPreviewListItem[];
};

export type DeckListResponse = {
  decks: DeckListItemDTO[];
};

export type DeckDetailResponse = {
  deck: DeckDTO;
  entries: DeckCardEntryDTO[];
  cardCount: number;
  uniqueCardCount: number;
  skippedCardPathIds: string[];
};

export type DeckMutationResponse = {
  deck: DeckDTO;
};

export type DeckCollectionImportResponse = {
  created: number;
  existing: number;
  skipped: number;
};

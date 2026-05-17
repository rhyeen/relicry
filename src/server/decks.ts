import 'server-only';

import { VersionedDeck } from '@/entities/Deck';
import {
  PlayerCard,
  PlayerCardCondition,
  PlayerCardLanguage,
  PlayerCardOwnership,
} from '@/entities/PlayerCard';
import type {
  DeckCardEntryDTO,
  DeckDetailResponse,
  DeckListItemDTO,
} from '@/lib/decksApi';
import { parseScannedCardPath } from '@/lib/scanQr';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { buildCardPreviewItems } from '@/server/cardsPreview';
import { invalidateDeckSoon } from '@/server/cache/deck.cache';
import { invalidatePlayerCardsSoon } from '@/server/cache/playerCard.cache';
import { CardDB } from '@/server/db/card.db';
import { DeckDB } from '@/server/db/deck.db';
import { PlayerCardDB } from '@/server/db/playerCard.db';
import { BadRequest, InvalidArgument, NotFound, Unauthorized } from '@/server/routeHelpers';

const DEFAULT_DECK_NAME = 'New Deck';

type DeckCardInput = {
  cardId: string;
  cardVersion: number;
  quantity: number;
};

export function serializeDeck(deck: VersionedDeck) {
  return {
    ...deck,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
    archivedAt: deck.archivedAt ? deck.archivedAt.toISOString() : null,
  };
}

export async function listDecksForUser(userId: string): Promise<DeckListItemDTO[]> {
  const deckDb = new DeckDB(getFirestoreAdmin());
  const decks = (await deckDb.getLatestByUser(userId)).filter((deck) => !deck.archivedAt);
  return Promise.all(decks.map(buildDeckListItem));
}

export async function createDeckForUser(userId: string, name: unknown): Promise<VersionedDeck> {
  const deckDb = new DeckDB(getFirestoreAdmin());
  const now = new Date();
  const deck: VersionedDeck = {
    id: await deckDb.generateId(),
    version: 1,
    isLatest: true,
    userId,
    name: normalizeDeckName(name, DEFAULT_DECK_NAME),
    cardPathIds: [],
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  };
  await deckDb.setAsLatest(deck);
  await invalidateDeckSoon(deck.id);
  return deck;
}

export async function getOwnedDeckDetail(userId: string, id: string): Promise<DeckDetailResponse> {
  const deck = await getOwnedDeck(userId, id);
  return buildDeckDetail(deck);
}

export async function updateOwnedDeck(
  userId: string,
  id: string,
  body: Record<string, unknown>,
): Promise<VersionedDeck> {
  const deck = await getOwnedDeck(userId, id);
  const nextDeck: VersionedDeck = {
    ...deck,
    name: body.name === undefined ? deck.name : normalizeDeckName(body.name, deck.name),
    archivedAt: body.archived === true ? new Date() : deck.archivedAt,
    updatedAt: new Date(),
  };
  await new DeckDB(getFirestoreAdmin()).setAsLatest(nextDeck);
  await invalidateDeckSoon(deck.id);
  return nextDeck;
}

export async function addCardToOwnedDeck(
  userId: string,
  id: string,
  body: Record<string, unknown>,
): Promise<VersionedDeck> {
  const deck = await getOwnedDeck(userId, id);
  const input = parseDeckCardInput(body);
  const card = await new CardDB(getFirestoreAdmin()).getFromParts(input.cardId, input.cardVersion);
  if (!card) throw new NotFound('Card');
  if (card.type === 'gambit') {
    throw new BadRequest('Gambit cards cannot be added to decks.');
  }

  const cardPathId = `c/${card.id}/${card.version}`;
  const nextDeck: VersionedDeck = {
    ...deck,
    cardPathIds: [
      ...deck.cardPathIds,
      ...Array.from({ length: input.quantity }, () => cardPathId),
    ],
    updatedAt: new Date(),
  };
  await new DeckDB(getFirestoreAdmin()).setAsLatest(nextDeck);
  await invalidateDeckSoon(deck.id);
  return nextDeck;
}

export async function removeCardFromOwnedDeck(
  userId: string,
  id: string,
  body: Record<string, unknown>,
): Promise<VersionedDeck> {
  const deck = await getOwnedDeck(userId, id);
  const input = parseDeckCardInput(body);
  const cardPathId = `c/${input.cardId}/${input.cardVersion}`;
  const removeAll = body.removeAll !== false;
  let removed = 0;
  const nextCardPathIds = deck.cardPathIds.filter((currentCardPathId) => {
    if (currentCardPathId !== cardPathId) return true;
    if (removeAll || removed < input.quantity) {
      removed += 1;
      return false;
    }
    return true;
  });

  const nextDeck: VersionedDeck = {
    ...deck,
    cardPathIds: nextCardPathIds,
    updatedAt: new Date(),
  };
  await new DeckDB(getFirestoreAdmin()).setAsLatest(nextDeck);
  await invalidateDeckSoon(deck.id);
  return nextDeck;
}

export async function importOwnedDeckToCollection(userId: string, id: string) {
  const deck = await getOwnedDeck(userId, id);
  const grouped = groupDeckCardRefs(deck.cardPathIds);
  const cardRefs = grouped.refs.map((ref) => ({
    cardId: ref.cardId,
    cardVersion: ref.cardVersion,
  }));
  const playerCardDb = new PlayerCardDB(getFirestoreAdmin());
  let created = 0;
  let existing = 0;

  for (const ref of cardRefs) {
    const current = await playerCardDb.getFromParts(userId, ref.cardId, ref.cardVersion);
    if (current) {
      existing += 1;
      continue;
    }
    await playerCardDb.set(createDefaultPlayerCard(userId, ref.cardId, ref.cardVersion));
    created += 1;
  }

  if (created > 0) await invalidatePlayerCardsSoon(userId);

  return {
    created,
    existing,
    skipped: grouped.skippedCardPathIds.length,
  };
}

export async function buildDeckDetail(deck: VersionedDeck): Promise<DeckDetailResponse> {
  const grouped = groupDeckCardRefs(deck.cardPathIds);
  const cardDb = new CardDB(getFirestoreAdmin());
  const entries: DeckCardEntryDTO[] = [];
  const skippedCardPathIds = [...grouped.skippedCardPathIds];

  for (const ref of grouped.refs) {
    const card = await cardDb.getFromParts(ref.cardId, ref.cardVersion);
    if (!card) {
      skippedCardPathIds.push(ref.cardPathId);
      continue;
    }
    const [preview] = await buildCardPreviewItems([card]);
    if (!preview) {
      skippedCardPathIds.push(ref.cardPathId);
      continue;
    }
    entries.push({
      cardPathId: ref.cardPathId,
      cardId: card.id,
      cardVersion: card.version,
      count: ref.count,
      preview,
    });
  }

  return {
    deck: serializeDeck(deck),
    entries,
    cardCount: deck.cardPathIds.length,
    uniqueCardCount: entries.length,
    skippedCardPathIds,
  };
}

async function buildDeckListItem(deck: VersionedDeck): Promise<DeckListItemDTO> {
  const detail = await buildDeckDetail(deck);
  return {
    deck: serializeDeck(deck),
    cardCount: detail.cardCount,
    uniqueCardCount: detail.uniqueCardCount,
    previews: detail.entries.slice(0, 4).map((entry) => entry.preview),
  };
}

async function getOwnedDeck(userId: string, id: string): Promise<VersionedDeck> {
  const deck = await new DeckDB(getFirestoreAdmin()).getLatest(id);
  if (!deck || deck.archivedAt) throw new NotFound('Deck');
  if (deck.userId !== userId) throw new Unauthorized('Deck owner mismatch');
  return deck;
}

function normalizeDeckName(value: unknown, fallback: string): string {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name) return fallback;
  return name.slice(0, 80);
}

function parseDeckCardInput(body: Record<string, unknown>): DeckCardInput {
  const rawCardId = typeof body.cardId === 'string' ? body.cardId : '';
  const cardId = rawCardId.startsWith('c/') ? rawCardId.slice(2) : rawCardId;
  const cardVersion = Number(body.cardVersion);
  const quantity = body.quantity === undefined ? 1 : Number(body.quantity);

  if (!/^[A-Za-z0-9]+$/.test(cardId)) {
    throw new InvalidArgument(['cardId'], 'card id');
  }
  if (!Number.isInteger(cardVersion) || cardVersion < 1) {
    throw new InvalidArgument(['cardVersion'], 'positive integer');
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new InvalidArgument(['quantity'], 'integer between 1 and 99');
  }

  return { cardId, cardVersion, quantity };
}

function groupDeckCardRefs(cardPathIds: string[]) {
  const grouped = new Map<string, {
    cardId: string;
    cardVersion: number;
    cardPathId: string;
    count: number;
  }>();
  const skippedCardPathIds: string[] = [];

  for (const cardPathId of cardPathIds) {
    const parsed = parseScannedCardPath(cardPathId);
    if (!parsed) {
      skippedCardPathIds.push(cardPathId);
      continue;
    }

    const current = grouped.get(parsed.cardPathId);
    if (current) {
      current.count += 1;
    } else {
      grouped.set(parsed.cardPathId, {
        ...parsed,
        count: 1,
      });
    }
  }

  return {
    refs: [...grouped.values()],
    skippedCardPathIds,
  };
}

function createDefaultPlayerCard(userId: string, cardId: string, cardVersion: number): PlayerCard {
  const now = new Date();
  return {
    userId,
    cardId,
    cardVersion,
    updatedAt: now,
    individuals: [{
      condition: PlayerCardCondition.NearMint,
      language: PlayerCardLanguage.English,
      graded: null,
      signedByIllustrator: false,
      signedByAuthor: false,
      notes: '',
      acquiredAt: now,
      acquiredFrom: '',
      foiled: false,
      ownership: PlayerCardOwnership.Owned,
    }],
  };
}

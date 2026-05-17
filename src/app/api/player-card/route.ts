import 'server-only';

import {
  getCardDocId,
  getCardId,
  VersionedCard,
  VersionedDeckCard,
  VersionedFocusCard,
} from '@/entities/Card';
import {
  getPlayerCardId,
  GradeID,
  GradingCompany,
  PlayerCard,
  PlayerCardCondition,
  PlayerCardLanguage,
  PlayerCardOwnership,
} from '@/entities/PlayerCard';
import {
  buildAspectFilterKeys,
  buildCardAspectKey,
  buildCardTitlePrefixes,
  parseCardSearchQuery,
} from '@/lib/cardQueryFields';
import {
  CARDS_PAGE_SIZE,
  CollectionCardFilters,
  getCardsPageNumber,
  parseCollectionFilters,
} from '@/lib/cardsList';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import type { CardPreviewListItem } from '@/lib/cardsApi';
import { buildCardPreviewItems, getCardsPreviewPage } from '@/server/cardsPreview';
import { CardDB } from '@/server/db/card.db';
import { PlayerCardDB } from '@/server/db/playerCard.db';
import { invalidatePlayerCardsSoon } from '@/server/cache/playerCard.cache';
import { authenticateUser, handleJsonResponse, handleRouteError, InvalidArgument } from '@/server/routeHelpers';

export async function GET(req: Request) {
  try {
    const { userId } = await authenticateUser(req);
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get('cardId');
    const rawCardVersion = searchParams.get('cardVersion');
    const db = new PlayerCardDB(getFirestoreAdmin());

    if (!cardId && rawCardVersion === null) {
      const playerCards = await db.getByUserId(userId);
      return handleJsonResponse(await buildCollectionResponse(playerCards, parseCollectionFilters(searchParams)));
    }

    if (!cardId) {
      throw new InvalidArgument(['cardId'], 'string');
    }
    const cardVersion = parseCardVersion(rawCardVersion);
    const entity = await db.getFromParts(userId, cardId, cardVersion);
    return handleJsonResponse({ playerCard: entity });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await authenticateUser(req);
    const playerCard = parsePlayerCard(await req.json(), userId);
    const saved = await new PlayerCardDB(getFirestoreAdmin()).set(playerCard);
    await invalidatePlayerCardsSoon(userId);
    return handleJsonResponse({ playerCard: saved });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await authenticateUser(req);
    const playerCard = parsePlayerCard(await req.json(), userId);
    const saved = await new PlayerCardDB(getFirestoreAdmin()).set(playerCard);
    await invalidatePlayerCardsSoon(userId);
    return handleJsonResponse({ playerCard: saved });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await authenticateUser(req);
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get('cardId');
    if (!cardId) {
      throw new InvalidArgument(['cardId'], 'string');
    }
    const cardVersion = parseCardVersion(searchParams.get('cardVersion'));

    await new PlayerCardDB(getFirestoreAdmin()).delete(getPlayerCardId(userId, cardId, cardVersion));
    await invalidatePlayerCardsSoon(userId);
    return handleJsonResponse({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}

async function buildCollectionResponse(
  playerCards: PlayerCard[],
  filters: CollectionCardFilters,
) {
  if (filters.scope === 'all') {
    const page = await getCardsPreviewPage(filters);
    return {
      ...page,
      playerCards,
      items: annotatePreviewItems(page.items, playerCards),
    };
  }

  const page = await getCollectionPreviewPage(playerCards, filters);
  return {
    ...page,
    playerCards,
    items: annotatePreviewItems(page.items, playerCards),
  };
}

async function getCollectionPreviewPage(
  playerCards: PlayerCard[],
  filters: CollectionCardFilters,
) {
  const cardDb = new CardDB(getFirestoreAdmin());
  const cards = await Promise.all(
    playerCards.map((playerCard) => cardDb.getFromParts(playerCard.cardId, playerCard.cardVersion))
  );
  const filteredCards = cards
    .filter((card): card is VersionedCard => card !== null)
    .filter((card) => matchesCardFilters(card, filters))
    .sort(compareCardsForPreview);
  const totalCards = filteredCards.length;
  const startIndex = filters.cursor
    ? filteredCards.findIndex((card) => serializeCardCursor(card) === filters.cursor) + 1
    : 0;
  const pageStartIndex = Math.max(0, startIndex);
  const pageCards = filteredCards.slice(pageStartIndex, pageStartIndex + CARDS_PAGE_SIZE + 1);
  const hasNext = pageCards.length > CARDS_PAGE_SIZE;
  const shownCards = hasNext ? pageCards.slice(0, CARDS_PAGE_SIZE) : pageCards;

  return {
    items: await buildCardPreviewItems(shownCards),
    page: getCardsPageNumber(filters),
    totalPages: Math.max(1, Math.ceil(totalCards / CARDS_PAGE_SIZE)),
    totalCards,
    pageSize: CARDS_PAGE_SIZE,
    nextCursor: hasNext ? serializeCardCursor(shownCards[shownCards.length - 1]!) : null,
  };
}

function annotatePreviewItems(previews: CardPreviewListItem[], playerCards: PlayerCard[]) {
  const playerCardMap = new Map(playerCards.map((playerCard) => [
    `${normalizeCardKey(playerCard.cardId)}:${playerCard.cardVersion}`,
    playerCard,
  ]));

  return previews.map((preview) => ({
    preview,
    playerCard: playerCardMap.get(`${normalizeCardKey(preview.card.id)}:${preview.card.version}`) ?? null,
  }));
}

function matchesCardFilters(card: VersionedCard, filters: CollectionCardFilters): boolean {
  if (filters.type !== 'all' && card.type !== filters.type) {
    return false;
  }

  if (filters.aspect !== 'all' && !matchesAspectFilter(card, filters.aspect)) {
    return false;
  }

  return matchesSearchFilter(card, filters.query);
}

function matchesAspectFilter(card: VersionedCard, aspect: CollectionCardFilters['aspect']): boolean {
  if (card.type === 'gambit') {
    return false;
  }

  const aspectKey = buildCardAspectKey((card as VersionedDeckCard | VersionedFocusCard).aspect);
  return !!aspectKey && buildAspectFilterKeys(aspect).includes(aspectKey);
}

function matchesSearchFilter(card: VersionedCard, query: string): boolean {
  const search = parseCardSearchQuery(query);
  if (!search.idOnly && !search.normalizedTitle && search.cardIds.length === 0) {
    return true;
  }

  const normalizedIds = new Set(search.cardIds.map((id) => id.toLowerCase()));
  const idMatches = normalizedIds.has(card.id.toLowerCase())
    || normalizedIds.has(getCardId(card.id).toLowerCase());

  if (search.idOnly) {
    return idMatches;
  }

  const titleMatches = search.normalizedTitle
    ? buildCardTitlePrefixes(card.title).includes(search.normalizedTitle)
    : false;
  return idMatches || titleMatches;
}

function compareCardsForPreview(left: VersionedCard, right: VersionedCard): number {
  const leftRevealed = left.revealedAt ? new Date(left.revealedAt).getTime() : 0;
  const rightRevealed = right.revealedAt ? new Date(right.revealedAt).getTime() : 0;

  if (rightRevealed !== leftRevealed) {
    return rightRevealed - leftRevealed;
  }

  return getCardDocId(right.id, right.version).localeCompare(getCardDocId(left.id, left.version));
}

function serializeCardCursor(card: VersionedCard): string {
  const revealedAt = card.revealedAt ? new Date(card.revealedAt) : null;
  const timestamp = revealedAt && Number.isFinite(revealedAt.getTime())
    ? revealedAt.toISOString()
    : 'null';

  return `${timestamp}::${getCardDocId(card.id, card.version)}`;
}

function normalizeCardKey(cardId: string): string {
  return cardId.startsWith('c/') ? cardId.slice(2) : cardId;
}

function parseCardVersion(value: string | null): number {
  const cardVersion = Number(value);
  if (!Number.isInteger(cardVersion) || cardVersion < 1) {
    throw new InvalidArgument(['cardVersion'], 'positive integer');
  }
  return cardVersion;
}

function parsePlayerCard(body: unknown, userId: string): PlayerCard {
  const data = body as Record<string, unknown>;
  const cardId = typeof data?.cardId === 'string' ? data.cardId : undefined;
  if (!cardId) {
    throw new InvalidArgument(['cardId'], 'string');
  }
  const cardVersion = parseCardVersion(String(data.cardVersion ?? ''));
  const rawIndividuals = Array.isArray(data.individuals) ? data.individuals : [];
  if (rawIndividuals.length === 0) {
    throw new InvalidArgument(['individuals'], 'non-empty array');
  }

  return {
    userId,
    cardId,
    cardVersion,
    individuals: rawIndividuals.map(parseIndividual),
    updatedAt: new Date(),
  };
}

function parseIndividual(raw: unknown): PlayerCard['individuals'][number] {
  const data = raw as Record<string, unknown>;
  const condition = parseEnum(data.condition, PlayerCardCondition, PlayerCardCondition.NearMint);
  const language = parseEnum(data.language, PlayerCardLanguage, PlayerCardLanguage.English);
  const ownership = parseEnum(data.ownership, PlayerCardOwnership, PlayerCardOwnership.Owned);
  const acquiredAt = typeof data.acquiredAt === 'string' || data.acquiredAt instanceof Date
    ? new Date(data.acquiredAt)
    : new Date();

  return {
    condition,
    language,
    graded: parseGrading(data.graded),
    signedByIllustrator: data.signedByIllustrator === true,
    signedByAuthor: data.signedByAuthor === true,
    notes: typeof data.notes === 'string' ? data.notes : '',
    acquiredAt: Number.isFinite(acquiredAt.getTime()) ? acquiredAt : new Date(),
    acquiredFrom: typeof data.acquiredFrom === 'string' ? data.acquiredFrom : '',
    foiled: data.foiled === true,
    ownership,
  };
}

function parseGrading(raw: unknown): PlayerCard['individuals'][number]['graded'] {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const data = raw as Record<string, unknown>;
  const company = parseEnum(data.company, GradingCompany, GradingCompany.PSA);
  const gradeId = parseEnum(data.gradeId, GradeID, GradeID.PSAGEMMT);
  const grade = Number(data.grade);

  return {
    company,
    grade: Number.isFinite(grade) ? grade : 10,
    gradeId,
  };
}

function parseEnum<T extends Record<string, string>>(
  value: unknown,
  enumValue: T,
  fallback: T[keyof T],
): T[keyof T] {
  return Object.values(enumValue).includes(value as T[keyof T])
    ? value as T[keyof T]
    : fallback;
}

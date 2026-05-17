import 'server-only';

import {
  getPlayerCardId,
  GradeID,
  GradingCompany,
  PlayerCard,
  PlayerCardCondition,
  PlayerCardLanguage,
  PlayerCardOwnership,
} from '@/entities/PlayerCard';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { buildCardPreviewItems } from '@/server/cardsPreview';
import { CardDB } from '@/server/db/card.db';
import { PlayerCardDB } from '@/server/db/playerCard.db';
import { invalidatePlayerCardsNow } from '@/server/cache/playerCard.cache';
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
      return handleJsonResponse({
        playerCards,
        items: await buildCollectionItems(playerCards),
      });
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
    await invalidatePlayerCardsNow(userId);
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
    await invalidatePlayerCardsNow(userId);
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
    await invalidatePlayerCardsNow(userId);
    return handleJsonResponse({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}

async function buildCollectionItems(playerCards: PlayerCard[]) {
  const cardDb = new CardDB(getFirestoreAdmin());
  const cards = await Promise.all(
    playerCards.map((playerCard) => cardDb.getFromParts(playerCard.cardId, playerCard.cardVersion))
  );
  const previews = await buildCardPreviewItems(cards.filter((card) => card !== null));
  const previewMap = new Map(previews.map((preview) => [
    `${preview.card.id}:${preview.card.version}`,
    preview,
  ]));

  return playerCards.map((playerCard) => ({
    playerCard,
    preview: previewMap.get(`${playerCard.cardId}:${playerCard.cardVersion}`) ?? null,
  }));
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

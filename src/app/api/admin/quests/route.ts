import { AdminRole } from '@/entities/AdminRole';
import { Faction } from '@/entities/Faction';
import { QuestToken, VersionedQuest, definedQuestTokenIds, getQuestDocId, getQuestId, getQuestTokenDocId, getTokenId } from '@/entities/Quest';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { invalidateQuestSoon } from '@/server/cache/quest.cache';
import { invalidateAnyTokenSoon, invalidateQuestTokensSoon } from '@/server/cache/questToken.cache';
import { QuestDB } from '@/server/db/quest.db';
import { QuestTokenDB } from '@/server/db/questToken.db';
import { BadRequest, authenticateUser, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

type EditableQuestToken = {
  id: string;
  faction: Faction;
};

function isFaction(value: unknown): value is Faction {
  return Object.values(Faction).includes(value as Faction);
}

function validateBody(quest: VersionedQuest, questTokens: EditableQuestToken[]) {
  if (!quest || typeof quest !== 'object') {
    throw new BadRequest('Quest payload is required.');
  }
  if (!Array.isArray(questTokens)) {
    throw new BadRequest('Quest tokens payload is required.');
  }
  if (!Number.isInteger(quest.level) || quest.level < 1) {
    throw new BadRequest('Quest level must be a whole number >= 1.');
  }
  if (!Number.isInteger(quest.season) || quest.season < 1) {
    throw new BadRequest('Quest season must be a whole number >= 1.');
  }
  if (!isFaction(quest.faction)) {
    throw new BadRequest('Quest faction is invalid.');
  }
  if (!Array.isArray(questTokens) || questTokens.length < 1 || questTokens.length > 5) {
    throw new BadRequest('Quest must have between 1 and 5 quest tokens.');
  }
  const normalizedTokenIds = questTokens.map((token) => getTokenId(token.id));
  if (new Set(normalizedTokenIds).size !== normalizedTokenIds.length) {
    throw new BadRequest('Quest tokens must be unique.');
  }
  if (normalizedTokenIds.some((id) => !definedQuestTokenIds.includes(id))) {
    throw new BadRequest('Quest token ID is invalid.');
  }
  if (questTokens.some((token) => !isFaction(token.faction))) {
    throw new BadRequest('Quest token faction is invalid.');
  }
}

export async function POST(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });
    const body = await req.json();
    const inputQuest = body.quest as VersionedQuest;
    const inputQuestTokens = body.questTokens as EditableQuestToken[];
    validateBody(inputQuest, inputQuestTokens);

    const firestoreAdmin = getFirestoreAdmin();
    const questDB = new QuestDB(firestoreAdmin);
    const questTokenDB = new QuestTokenDB(firestoreAdmin);

    const quest: VersionedQuest = {
      ...inputQuest,
      id: inputQuest.id?.trim() ? getQuestId(inputQuest.id.trim()) : await questDB.generateId(),
      revealed: {
        at: inputQuest.revealed?.at ? new Date(inputQuest.revealed.at) : new Date(),
        context: inputQuest.revealed?.context?.trim() || undefined,
      },
    };
    const updatedQuest = await questDB.set(quest);

    const questDocId = getQuestDocId(updatedQuest.id, updatedQuest.season);
    const questTokens: QuestToken[] = inputQuestTokens.map((token) => ({
      id: getTokenId(token.id),
      faction: token.faction,
      questId: questDocId,
      season: updatedQuest.season,
    }));
    const existingQuestTokens = await questTokenDB.getQuestTokens(updatedQuest.id, updatedQuest.season);
    const nextDocIds = new Set(questTokens.map((token) => getQuestTokenDocId(token.id, token.questId, token.season)));
    const deleteDocIds = existingQuestTokens
      .map((token) => getQuestTokenDocId(token.id, token.questId, token.season))
      .filter((docId) => !nextDocIds.has(docId));

    if (deleteDocIds.length > 0) {
      await questTokenDB.batchDelete(deleteDocIds);
    }
    await questTokenDB.batchSet(questTokens);

    const tokenIdsToInvalidate = Array.from(new Set([
      ...existingQuestTokens.map((token) => token.id),
      ...questTokens.map((token) => token.id),
    ]));

    await Promise.all([
      invalidateQuestSoon(updatedQuest.id),
      invalidateQuestSoon(updatedQuest.id, `${updatedQuest.season}`),
      invalidateQuestTokensSoon(updatedQuest.id, updatedQuest.season),
      ...tokenIdsToInvalidate.map((tokenId) => invalidateAnyTokenSoon(tokenId)),
    ]);

    return handleJsonResponse({ quest: updatedQuest, questTokens });
  } catch (e) {
    return handleRouteError(e);
  }
}

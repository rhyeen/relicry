import { AdminRole } from '@/entities/AdminRole';
import { getEventId } from '@/entities/Event';
import { Reward, UniqueReward } from '@/entities/Reward';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import {
  invalidateUniqueRewardListSoon,
  invalidateUniqueRewardSoon,
} from '@/server/cache/uniqueReward.cache';
import { RewardDB } from '@/server/db/reward.db';
import { UniqueRewardDB } from '@/server/db/uniqueReward.db';
import {
  authenticateUser,
  BadRequest,
  handleJsonResponse,
  handleRouteError,
  NotFound,
} from '@/server/routeHelpers';

function parseLevel(value: unknown): number {
  const level = Number.parseInt(`${value}`, 10);
  if (!Number.isInteger(level) || level < 1 || level > 3) {
    throw new BadRequest('Reward level must be 1, 2, or 3.');
  }
  return level;
}

async function getRewardOrThrow(firestoreAdmin: FirebaseFirestore.Firestore, eventId: string, level: number): Promise<Reward> {
  const reward = await new RewardDB(firestoreAdmin).getFromParts(eventId, level);
  if (!reward || reward.archivedAt !== null) {
    throw new NotFound('Reward', `Reward not found for event ${eventId} level ${level}`);
  }
  return reward;
}

export async function POST(req: Request) {
  try {
    await authenticateUser(req, { adminRole: AdminRole.EventAdmin });
    const body = await req.json();
    const eventId = getEventId(String(body?.eventId ?? ''));
    const level = parseLevel(body?.level);
    const count = Number.parseInt(`${body?.count ?? ''}`, 10);

    if (!eventId || eventId === 'e/') {
      throw new BadRequest('Event ID is required.');
    }
    if (!Number.isInteger(count) || count < 1 || count > 100) {
      throw new BadRequest('Count must be a whole number between 1 and 100.');
    }

    const firestoreAdmin = getFirestoreAdmin();
    await getRewardOrThrow(firestoreAdmin, eventId, level);

    const uniqueRewardDB = new UniqueRewardDB(firestoreAdmin);
    const uniqueRewards: UniqueReward[] = [];
    for (let index = 0; index < count; index += 1) {
      const id = await uniqueRewardDB.generateId(level);
      uniqueRewards.push({
        id,
        eventId,
        level,
      });
    }

    await uniqueRewardDB.batchSet(uniqueRewards);
    await invalidateUniqueRewardListSoon(eventId, level);
    return handleJsonResponse({ uniqueRewards });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    await authenticateUser(req, { adminRole: AdminRole.EventAdmin });
    const body = await req.json();
    const id = String(body?.id ?? '');
    const action = String(body?.action ?? '');

    if (!id) {
      throw new BadRequest('Unique reward ID is required.');
    }
    if (action !== 'publish' && action !== 'archive') {
      throw new BadRequest('Action must be publish or archive.');
    }

    const firestoreAdmin = getFirestoreAdmin();
    const uniqueRewardDB = new UniqueRewardDB(firestoreAdmin);
    const uniqueReward = await uniqueRewardDB.getFromParts(id);
    if (!uniqueReward) {
      throw new NotFound('UniqueReward', `Unique reward not found: ${id}`);
    }

    const nextUniqueReward: UniqueReward = action === 'publish'
      ? {
          ...uniqueReward,
          published: uniqueReward.published ?? { at: new Date() },
          archived: undefined,
        }
      : {
          ...uniqueReward,
          archived: { at: new Date() },
        };

    await uniqueRewardDB.set(nextUniqueReward);
    await Promise.all([
      invalidateUniqueRewardSoon(nextUniqueReward.id),
      invalidateUniqueRewardListSoon(nextUniqueReward.eventId, nextUniqueReward.level),
    ]);
    return handleJsonResponse({ uniqueReward: nextUniqueReward });
  } catch (e) {
    return handleRouteError(e);
  }
}

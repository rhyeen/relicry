import { AdminRole } from '@/entities/AdminRole';
import { Event, getEventId } from '@/entities/Event';
import { getCardId } from '@/entities/Card';
import { invalidateEventListSoon, invalidateEventSoon } from '@/server/cache/event.cache';
import { EventDB } from '@/server/db/event.db';
import { authenticateUser, BadRequest, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { Reward } from '@/entities/Reward';
import { invalidateRewardSoon } from '@/server/cache/reward.cache';
import { RewardDB } from '@/server/db/reward.db';
import { normalizeStarterDeckFocusCardIds } from '@/lib/starterDecks';
import { getFeaturedStarterFocusOptions } from '@/server/starterDecks';

function validateEvent(input: Event) {
  if (!input || typeof input !== 'object') {
    throw new BadRequest('Event payload is required.');
  }
  if (!input.title?.trim()) {
    throw new BadRequest('Event title is required.');
  }
  if (!input.description?.trim()) {
    throw new BadRequest('Event description is required.');
  }

  const from = new Date(input.running?.from);
  const to = new Date(input.running?.to);
  if (Number.isNaN(from.getTime())) {
    throw new BadRequest('Event running.from is invalid.');
  }
  if (Number.isNaN(to.getTime())) {
    throw new BadRequest('Event running.to is invalid.');
  }
  if (to < from) {
    throw new BadRequest('Event running.to must be on or after running.from.');
  }
}

function validateRewardLevels(input: unknown): number[] {
  if (!Array.isArray(input)) {
    throw new BadRequest('Reward levels payload must be an array.');
  }

  const levels = input.map((value) => Number.parseInt(`${value}`, 10));
  if (levels.some((level) => !Number.isInteger(level) || level < 1 || level > 3)) {
    throw new BadRequest('Reward levels must only contain 1, 2, or 3.');
  }

  if (new Set(levels).size !== levels.length) {
    throw new BadRequest('Reward levels must be unique.');
  }

  return levels.sort((a, b) => a - b);
}

export async function POST(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.EventAdmin,
    });
    const body = await req.json();
    const inputEvent = body.event as Event;
    const rewardLevels = validateRewardLevels(body.rewardLevels ?? []);
    validateEvent(inputEvent);
    const starterDeckFocusCardIds = normalizeStarterDeckFocusCardIds(inputEvent.starterDeckFocusCardIds).map(getCardId);
    const validStarterIds = new Set((await getFeaturedStarterFocusOptions()).map((option) => option.id));
    if (starterDeckFocusCardIds.some((id) => !validStarterIds.has(id))) {
      throw new BadRequest('Starter deck focus card IDs must be featured focus cards.');
    }

    const firestoreAdmin = getFirestoreAdmin();
    const db = new EventDB(firestoreAdmin);
    const event: Event = {
      ...inputEvent,
      id: inputEvent.id?.trim() ? getEventId(inputEvent.id.trim()) : await db.generateId(),
      title: inputEvent.title.trim(),
      description: inputEvent.description.trim(),
      running: {
        from: new Date(inputEvent.running.from),
        to: new Date(inputEvent.running.to),
      },
      starterDeckFocusCardIds,
      archivedAt: inputEvent.archivedAt ? new Date(inputEvent.archivedAt) : null,
    };
    const updatedEvent = await db.set(event);
    const rewardDB = new RewardDB(firestoreAdmin);
    const existingRewards = await rewardDB.getBy({
      where: [{ field: 'eventId', op: '==', value: updatedEvent.id }],
    });
    const now = new Date();
    const allLevels = [...new Set([...rewardLevels, ...existingRewards.map((reward) => reward.level)])];

    await Promise.all(allLevels.map(async (level) => {
      const existing = existingRewards.find((reward) => reward.level === level);
      const shouldExist = rewardLevels.includes(level);

      if (shouldExist) {
        const reward: Reward = existing ? {
          ...existing,
          archivedAt: null,
        } : {
          eventId: updatedEvent.id,
          level,
          questId: null,
          sceneId: null,
          createdAt: now,
          updatedAt: now,
          archivedAt: null,
        };
        await rewardDB.set(reward);
        return;
      }

      if (existing && existing.archivedAt === null) {
        await rewardDB.set({
          ...existing,
          archivedAt: now,
        });
      }
    }));

    await Promise.all([
      invalidateEventSoon(updatedEvent.id),
      invalidateEventListSoon(),
      ...allLevels.map((level) => invalidateRewardSoon(updatedEvent.id, level)),
    ]);
    return handleJsonResponse({ event: updatedEvent });
  } catch (e) {
    return handleRouteError(e);
  }
}

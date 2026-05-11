import 'server-only';

import { NextResponse } from 'next/server';
import { AdminRole } from '@/entities/AdminRole';
import { getCardId } from '@/entities/Card';
import { getEventId } from '@/entities/Event';
import { User } from '@/entities/User';
import { conformDocId } from '@/lib/firestoreConform';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { normalizeStarterDeckFocusCardIds, normalizeUserStarterFields } from '@/lib/starterDecks';
import { invalidateUserSoon } from '@/server/cache/user.cache';
import { EventDB } from '@/server/db/event.db';
import { UserDB } from '@/server/db/user.db';
import { getStarterFocusOptionsByIds, getStarterObtainedViews } from '@/server/starterDecks';
import {
  authenticateUser,
  BadRequest,
  handleJsonResponse,
  handleRouteError,
  NotFound,
} from '@/server/routeHelpers';

class StarterAlreadyClaimed extends Error {
  constructor(public readonly user: User) {
    super('Starter deck already claimed.');
  }
}

async function getScanEvent(eventId: string) {
  const event = await new EventDB(getFirestoreAdmin()).getFromParts(eventId);
  if (!event || event.archivedAt) {
    throw new NotFound('Event', eventId);
  }
  return event;
}

async function buildScanResponse(eventId: string, scannedUserId: string | null) {
  const event = await getScanEvent(eventId);
  const player = scannedUserId ? await new UserDB(getFirestoreAdmin()).getFromParts(scannedUserId) : null;
  if (scannedUserId && !player) {
    throw new NotFound('User', scannedUserId);
  }

  return {
    event,
    player,
    starterOptions: await getStarterFocusOptionsByIds(event.starterDeckFocusCardIds ?? []),
    existingStarterDecks: player ? await getStarterObtainedViews(player) : [],
  };
}

export async function GET(req: Request) {
  try {
    await authenticateUser(req, { adminRole: AdminRole.EventAdmin });
    const { searchParams } = new URL(req.url);
    const rawEventId = searchParams.get('eventId')?.trim() ?? '';
    if (!rawEventId) {
      throw new BadRequest('eventId is required.');
    }
    const eventId = getEventId(rawEventId);
    const scannedUserId = searchParams.get('userId');

    return handleJsonResponse(await buildScanResponse(eventId, scannedUserId));
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(req: Request) {
  try {
    const { user: adminUser } = await authenticateUser(req, { adminRole: AdminRole.EventAdmin });

    const body = await req.json().catch(() => ({}));
    const rawEventId = typeof body.eventId === 'string' ? body.eventId.trim() : '';
    const scannedUserId = typeof body.userId === 'string' ? body.userId.trim() : '';
    const rawFocusCardId = typeof body.focusCardId === 'string' ? body.focusCardId.trim() : '';
    const focusCardId = rawFocusCardId ? getCardId(rawFocusCardId) : '';
    const proceedAnyway = body.proceedAnyway === true;

    if (!rawEventId) {
      throw new BadRequest('eventId is required.');
    }
    if (!scannedUserId) {
      throw new BadRequest('userId is required.');
    }
    if (!focusCardId) {
      throw new BadRequest('focusCardId is required.');
    }

    const event = await getScanEvent(getEventId(rawEventId));
    const eventStarterIds = new Set(normalizeStarterDeckFocusCardIds(event.starterDeckFocusCardIds).map(getCardId));
    if (!eventStarterIds.has(focusCardId)) {
      throw new BadRequest('Selected starter deck is not configured for this event.');
    }

    const firestoreAdmin = getFirestoreAdmin();
    const playerRef = firestoreAdmin.collection('users').doc(conformDocId(scannedUserId));
    const now = new Date();

    try {
      await firestoreAdmin.runTransaction(async (transaction) => {
        const playerDoc = await transaction.get(playerRef);
        if (!playerDoc.exists) {
          throw new NotFound('User', scannedUserId);
        }

        const player = normalizeUserStarterFields(playerDoc.data() as User) as User;
        const existingStarters = Object.values(player.startersObtained);
        if (existingStarters.length > 0 && !proceedAnyway) {
          throw new StarterAlreadyClaimed(player);
        }

        transaction.set(playerRef, {
          startersObtained: {
            ...player.startersObtained,
            [focusCardId]: {
              id: focusCardId,
              obtainedAt: now,
              obtainedBy: adminUser.id,
              atEventId: event.id,
            },
          },
          updatedAt: now,
        }, { merge: true });
      });
    } catch (e) {
      if (e instanceof StarterAlreadyClaimed) {
        return NextResponse.json({
          error: e.message,
          existingStarterDecks: await getStarterObtainedViews(e.user),
        }, { status: 409 });
      }
      throw e;
    }

    await invalidateUserSoon(scannedUserId);
    const player = await new UserDB(firestoreAdmin).getFromParts(scannedUserId);
    if (!player) {
      throw new NotFound('User', scannedUserId);
    }

    return handleJsonResponse({
      ok: true,
      player,
      existingStarterDecks: await getStarterObtainedViews(player),
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

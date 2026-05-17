import { AdminRole } from '@/entities/AdminRole';
import { getArtistId } from '@/entities/Artist';
import { getEventId } from '@/entities/Event';
import { getHeraldId, Herald } from '@/entities/Herald';
import { getUserId } from '@/entities/User';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { invalidateHeraldListSoon, invalidateHeraldSoon } from '@/server/cache/herald.cache';
import { ArtistDB } from '@/server/db/artist.db';
import { EventDB } from '@/server/db/event.db';
import { HeraldDB } from '@/server/db/herald.db';
import { UserDB } from '@/server/db/user.db';
import { getHeraldEditorOptions } from '@/server/heralds';
import { authenticateUser, BadRequest, handleJsonResponse, handleRouteError, NotFound } from '@/server/routeHelpers';

function asDate(value: unknown): Date | null {
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? null : date;
}

function cleanString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function cleanPromotedItemIds(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const ids = [...new Set(value.map(cleanString).filter((id): id is string => !!id))];
  return ids.length > 0 ? ids : undefined;
}

function normalizeLimitedTime(input: Herald, eventFrom: Date, eventTo: Date): Herald['limitedTimeAtEvent'] {
  if (!input.limitedTimeAtEvent) return undefined;

  const from = asDate(input.limitedTimeAtEvent.from);
  const to = asDate(input.limitedTimeAtEvent.to);
  if (!from || !to) {
    throw new BadRequest('Herald limited time dates are invalid.');
  }
  if (to < from) {
    throw new BadRequest('Herald limited time to date must be on or after from date.');
  }
  if (from < eventFrom || to > eventTo) {
    throw new BadRequest('Herald limited time dates must be within the event running dates.');
  }

  return { from, to };
}

export async function GET(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.EventAdmin,
    });
    const url = new URL(req.url);
    if (url.searchParams.get('options') === '1') {
      const options = await getHeraldEditorOptions();
      return handleJsonResponse({ options });
    }

    const db = new HeraldDB(getFirestoreAdmin());
    const heralds = await db.getBy({
      where: [],
      sortBy: { field: 'createdAt', direction: 'desc' },
      limit: 100,
    });
    return handleJsonResponse({ heralds });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.EventAdmin,
    });
    const body = await req.json();
    const inputHerald = body.herald as Herald;
    if (!inputHerald || typeof inputHerald !== 'object') {
      throw new BadRequest('Herald payload is required.');
    }

    const firestoreAdmin = getFirestoreAdmin();
    const heraldDB = new HeraldDB(firestoreAdmin);
    const userDB = new UserDB(firestoreAdmin);
    const eventDB = new EventDB(firestoreAdmin);
    const artistDB = new ArtistDB(firestoreAdmin);

    const userId = getUserId(cleanString(inputHerald.userId) ?? '');
    const eventId = getEventId(cleanString(inputHerald.eventId) ?? '');
    if (!cleanString(inputHerald.userId)) {
      throw new BadRequest('Herald user is required.');
    }
    if (!cleanString(inputHerald.eventId)) {
      throw new BadRequest('Herald event is required.');
    }

    const [user, event] = await Promise.all([
      userDB.getFromParts(userId),
      eventDB.getFromParts(eventId),
    ]);
    if (!user || user.archivedAt) {
      throw new NotFound('User', `Herald user not found: ${userId}`);
    }
    if (!event || event.archivedAt) {
      throw new NotFound('Event', `Herald event not found: ${eventId}`);
    }

    const artistId = cleanString(inputHerald.artistId) ? getArtistId(inputHerald.artistId as string) : null;
    if (artistId) {
      const artist = await artistDB.getFromParts(artistId);
      if (!artist || artist.archivedAt) {
        throw new NotFound('Artist', `Herald artist not found: ${artistId}`);
      }
    }

    const now = new Date();
    const id = cleanString(inputHerald.id) ? getHeraldId(inputHerald.id) : await heraldDB.generateId();
    const createdAt = asDate(inputHerald.createdAt) ?? now;
    const archivedAt = inputHerald.archivedAt ? (asDate(inputHerald.archivedAt) ?? now) : null;
    const herald: Herald = {
      ...inputHerald,
      id,
      userId,
      artistId,
      eventId,
      override: {
        name: cleanString(inputHerald.override?.name),
        profileImageUrl: cleanString(inputHerald.override?.profileImageUrl),
        bannerImageUrl: cleanString(inputHerald.override?.bannerImageUrl),
        summary: cleanString(inputHerald.override?.summary),
        promotedItemIds: cleanPromotedItemIds(inputHerald.override?.promotedItemIds),
      },
      mapPin: {
        id: 'NOT_SET',
        x: 0,
        y: 0,
      },
      limitedTimeAtEvent: normalizeLimitedTime(inputHerald, event.running.from, event.running.to),
      createdAt,
      updatedAt: now,
      archivedAt,
    };

    const updatedHerald = await heraldDB.set(herald);
    await Promise.all([
      invalidateHeraldSoon(updatedHerald.id),
      invalidateHeraldListSoon(),
    ]);
    return handleJsonResponse({ herald: updatedHerald });
  } catch (e) {
    return handleRouteError(e);
  }
}

import 'server-only';

import { ImageSize, ImageStorage } from '@/entities/Image';
import { User } from '@/entities/User';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { isActiveEventCurrent, normalizeActiveEvent, normalizeStarterObtainedMap } from '@/lib/starterDecks';
import { invalidateUserSoon } from '@/server/cache/user.cache';
import { EventDB } from '@/server/db/event.db';
import { UserDB } from '@/server/db/user.db';
import { getStarterObtainedViews } from '@/server/starterDecks';
import { authenticateUser, BadRequest, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

function validateImageStorage(value: unknown): ImageStorage | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const input = value as Partial<ImageStorage>;
  if (typeof input.path !== 'string') return undefined;
  return {
    path: input.path,
    url: typeof input.url === 'string' ? input.url : undefined,
  };
}

function validateProfileImage(value: unknown): User['profileImage'] | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const input = value as Record<string, unknown>;
  return {
    [ImageSize.Banner]: validateImageStorage(input[ImageSize.Banner]),
    [ImageSize.Thumb]: validateImageStorage(input[ImageSize.Thumb]),
  };
}

async function getProfileResponse(user: User) {
  const activeEvent = normalizeActiveEvent(user.activeEvent);
  const event = activeEvent ? await new EventDB(getFirestoreAdmin()).getFromParts(activeEvent.id) : null;

  return {
    user: {
      ...user,
      startersObtained: normalizeStarterObtainedMap(user.startersObtained),
      activeEvent,
    },
    starterDecksObtained: await getStarterObtainedViews(user),
    activeEvent: activeEvent ? {
      ...activeEvent,
      title: event?.title ?? activeEvent.id,
    } : null,
    activeEventCurrent: isActiveEventCurrent(activeEvent) && !!event && !event.archivedAt,
  };
}

export async function GET(req: Request) {
  try {
    const { user } = await authenticateUser(req);
    return handleJsonResponse(await getProfileResponse(user));
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const { user } = await authenticateUser(req);
    const body = await req.json().catch(() => ({}));
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : user.displayName;
    const email = typeof body.email === 'string' ? body.email.trim() : user.email;

    if (displayName.length > 80) {
      throw new BadRequest('Display name must be 80 characters or fewer.');
    }
    if (email.length > 160) {
      throw new BadRequest('Email must be 160 characters or fewer.');
    }

    const nextUser: User = {
      ...user,
      displayName,
      email,
      profileImage: validateProfileImage(body.profileImage),
      updatedAt: new Date(),
    };

    const updatedUser = await new UserDB(getFirestoreAdmin()).set(nextUser);
    await invalidateUserSoon(updatedUser.id);

    return handleJsonResponse(await getProfileResponse(updatedUser));
  } catch (e) {
    return handleRouteError(e);
  }
}

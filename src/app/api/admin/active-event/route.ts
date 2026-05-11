import 'server-only';

import { AdminRole } from '@/entities/AdminRole';
import { getEventId } from '@/entities/Event';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { isActiveEventCurrent } from '@/lib/starterDecks';
import { invalidateUserSoon } from '@/server/cache/user.cache';
import { EventDB } from '@/server/db/event.db';
import { UserDB } from '@/server/db/user.db';
import { authenticateUser, BadRequest, handleJsonResponse, handleRouteError, NotFound } from '@/server/routeHelpers';

export async function POST(req: Request) {
  try {
    const { user } = await authenticateUser(req, { adminRole: AdminRole.EventAdmin });
    const body = await req.json().catch(() => ({}));
    const rawEventId = typeof body.eventId === 'string' ? body.eventId.trim() : '';
    if (!rawEventId) {
      throw new BadRequest('eventId is required.');
    }
    const eventId = getEventId(rawEventId);

    const firestoreAdmin = getFirestoreAdmin();
    const event = await new EventDB(firestoreAdmin).getFromParts(eventId);
    if (!event || event.archivedAt) {
      throw new NotFound('Event', eventId);
    }

    const updatedUser = await new UserDB(firestoreAdmin).set({
      ...user,
      activeEvent: {
        id: event.id,
        checkedInAt: new Date(),
      },
      updatedAt: new Date(),
    });
    await invalidateUserSoon(updatedUser.id);

    return handleJsonResponse({
      user: updatedUser,
      activeEventCurrent: isActiveEventCurrent(updatedUser.activeEvent),
      event,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const { user } = await authenticateUser(req, { adminRole: AdminRole.EventAdmin });
    const updatedUser = await new UserDB(getFirestoreAdmin()).set({
      ...user,
      activeEvent: null,
      updatedAt: new Date(),
    });
    await invalidateUserSoon(updatedUser.id);

    return handleJsonResponse({
      user: updatedUser,
      activeEventCurrent: false,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

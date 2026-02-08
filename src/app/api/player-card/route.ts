import 'server-only';

import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { authenticateUser, handleJsonResponse, handleOkResponse, handleRouteError, InvalidArgument, NotFound } from '@/server/routeHelpers';
import { PlayerCardDB } from '@/server/db/playerCard.db';

export async function GET(req: Request) {
  try {
    const { userId } = await authenticateUser(req);
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get('cardId');
    const cardVersion = Number(searchParams.get('cardVersion'));
    if (!cardId) {
      throw new InvalidArgument(['cardId'], 'string');
    }
    if (!Number.isFinite(cardVersion)) {
      throw new InvalidArgument(['cardVersion'], 'number');
    }
    const entity = await new PlayerCardDB(getFirestoreAdmin()).getFromParts(userId, cardId, cardVersion);
    if (!entity) {
      throw new NotFound('PlayerCard');
    }
    return handleJsonResponse({ playerCard: entity });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await authenticateUser(req);
    const body = await req.json();
    const cardId = body?.cardId as string | undefined;
    const cardVersion = Number(body?.cardVersion);
    if (!cardId) {
      throw new InvalidArgument(['cardId'], 'string');
    }
    if (!Number.isFinite(cardVersion)) {
      throw new InvalidArgument(['cardVersion'], 'number');
    }
    if (userId !== body.userId) {
      throw new InvalidArgument(['userId'], 'same as that of authenticated user');
    }
    await new PlayerCardDB(getFirestoreAdmin()).set(body);
    return handleOkResponse();
  } catch (e) {
    return handleRouteError(e);
  }
}

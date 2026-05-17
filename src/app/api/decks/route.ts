import 'server-only';

import {
  createDeckForUser,
  listDecksForUser,
  serializeDeck,
} from '@/server/decks';
import { authenticateUser, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

export async function GET(req: Request) {
  try {
    const { userId } = await authenticateUser(req);
    return handleJsonResponse({ decks: await listDecksForUser(userId) });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await authenticateUser(req);
    const body = await req.json().catch(() => ({}));
    const deck = await createDeckForUser(userId, body?.name);
    return handleJsonResponse({ deck: serializeDeck(deck) });
  } catch (e) {
    return handleRouteError(e);
  }
}

import 'server-only';

import {
  getOwnedDeckDetail,
  serializeDeck,
  updateOwnedDeck,
} from '@/server/decks';
import { authenticateUser, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

type Params = { id: string };

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [{ userId }, { id }] = await Promise.all([authenticateUser(req), params]);
    return handleJsonResponse(await getOwnedDeckDetail(userId, id));
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [{ userId }, { id }, body] = await Promise.all([
      authenticateUser(req),
      params,
      req.json().catch(() => ({})),
    ]);
    const deck = await updateOwnedDeck(userId, id, body);
    return handleJsonResponse({ deck: serializeDeck(deck) });
  } catch (e) {
    return handleRouteError(e);
  }
}

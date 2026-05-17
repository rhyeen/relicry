import 'server-only';

import {
  addCardToOwnedDeck,
  removeCardFromOwnedDeck,
  serializeDeck,
} from '@/server/decks';
import { authenticateUser, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

type Params = { id: string };

export async function POST(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [{ userId }, { id }, body] = await Promise.all([
      authenticateUser(req),
      params,
      req.json().catch(() => ({})),
    ]);
    const deck = await addCardToOwnedDeck(userId, id, body);
    return handleJsonResponse({ deck: serializeDeck(deck) });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [{ userId }, { id }, body] = await Promise.all([
      authenticateUser(req),
      params,
      req.json().catch(() => ({})),
    ]);
    const deck = await removeCardFromOwnedDeck(userId, id, body);
    return handleJsonResponse({ deck: serializeDeck(deck) });
  } catch (e) {
    return handleRouteError(e);
  }
}

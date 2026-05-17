import 'server-only';

import { importOwnedDeckToCollection } from '@/server/decks';
import { authenticateUser, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

type Params = { id: string };

export async function POST(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [{ userId }, { id }] = await Promise.all([authenticateUser(req), params]);
    return handleJsonResponse(await importOwnedDeckToCollection(userId, id));
  } catch (e) {
    return handleRouteError(e);
  }
}

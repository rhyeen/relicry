import 'server-only';

import { authenticateUser, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

export async function GET(req: Request) {
  try {
    const { user } = await authenticateUser(req);
    return handleJsonResponse({ user });
  } catch (e) {
    return handleRouteError(e);
  }
}

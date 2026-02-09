import { AdminRole } from '@/entities/AdminRole';
import { Art } from '@/entities/Art';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { invalidateArtSoon } from '@/server/cache/art.cache';
import { ArtDB } from '@/server/db/art.db';
import { authenticateUser, BadRequest, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

export async function GET(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    if (type && type !== 'illustration' && type !== 'writing') {
      throw new BadRequest(`Invalid art type: ${type}`);
    }
    const db = new ArtDB(getFirestoreAdmin());
    const arts = await db.getBy({
      where: type ? [{ field: 'type', op: '==', value: type }] : [],
      sortBy: { field: 'createdAt', direction: 'desc' },
    });
    return handleJsonResponse({ arts });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });
    const body = await req.json();
    const art = body.art as Art;
    const db = new ArtDB(getFirestoreAdmin());
    if (!art.id) {
      art.id = await db.generateId();
    }
    const updatedArt = await db.set(art);
    await invalidateArtSoon(art.id);
    return handleJsonResponse({ art: updatedArt });
  } catch (e) {
    return handleRouteError(e);
  }
}

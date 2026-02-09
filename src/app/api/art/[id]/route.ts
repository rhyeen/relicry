import { AdminRole } from '@/entities/AdminRole';
import { Art, getArtId } from '@/entities/Art';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { ArtDB } from '@/server/db/art.db';
import { authenticateUser, handleJsonResponse, handleRouteError, NotFound } from '@/server/routeHelpers';

type Params = { id: string };

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });
    const { id } = await params;
    const conformedId = getArtId(id);
    const art = await new ArtDB(getFirestoreAdmin()).getFromParts(conformedId);
    if (!art) {
      throw new NotFound('Art', `Art not found: ${conformedId}`);
    }
    return handleJsonResponse({ art: art as Art });
  } catch (e) {
    return handleRouteError(e);
  }
}

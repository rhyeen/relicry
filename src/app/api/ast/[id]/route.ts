import { AdminRole } from '@/entities/AdminRole';
import { Artist, getArtistId } from '@/entities/Artist';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { ArtistDB } from '@/server/db/artist.db';
import { authenticateUser, handleJsonResponse, handleRouteError, NotFound } from '@/server/routeHelpers';

type Params = { id: string };

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });
    const { id } = await params;
    const conformedId = getArtistId(id);
    const artist = await new ArtistDB(firestoreAdmin).getFromParts(conformedId);
    if (!artist) {
      throw new NotFound('Artist', `Artist not found: ${conformedId}`);
    }
    return handleJsonResponse({ artist: artist as Artist });
  } catch (e) {
    return handleRouteError(e);
  }
}

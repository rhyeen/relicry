import { AdminRole } from '@/entities/AdminRole';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { ArtistDB } from '@/server/db/artist.db';
import { authenticateUser, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

const REINDEX_BATCH_SIZE = 200;

/**
 * Rewrites all artist docs so conformItemSet can refresh derived query index fields.
 */
export async function POST(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });

    const db = new ArtistDB(getFirestoreAdmin());
    const artists = [];
    let offset = 0;

    while (true) {
      const page = await db.getBy({
        where: [],
        limit: REINDEX_BATCH_SIZE,
        offset,
      });

      if (page.length === 0) {
        break;
      }

      artists.push(...page);
      offset += page.length;
    }

    await db.batchSet(artists);

    return handleJsonResponse({
      updatedArtists: artists.length,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

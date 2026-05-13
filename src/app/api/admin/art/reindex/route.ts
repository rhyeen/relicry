import { AdminRole } from '@/entities/AdminRole';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { ArtDB } from '@/server/db/art.db';
import { authenticateUser, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

const REINDEX_BATCH_SIZE = 200;

/**
 * Rewrites all art docs so conformItemSet can refresh derived query index fields.
 */
export async function POST(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });

    const db = new ArtDB(getFirestoreAdmin());
    const arts = [];
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

      arts.push(...page);
      offset += page.length;
    }

    await db.batchSet(arts);

    return handleJsonResponse({
      updatedArts: arts.length,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

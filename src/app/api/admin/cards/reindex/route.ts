import { AdminRole } from '@/entities/AdminRole';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { CardDB } from '@/server/db/card.db';
import { authenticateUser, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

const REINDEX_BATCH_SIZE = 200;

/**
 * This is used to trigger a reindex of all cards in the database,
 * which will update the search indexes for all cards.
 * This is necessary after we add new search indexes or change how we compute them.
 * It can also be used to fix any potential issues with the search indexes
 * (e.g. if we discover a bug in the indexing logic).
 * 
 * See conformItemSet in card.db.ts for the actual indexing logic.
 */
export async function POST(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });

    const db = new CardDB(getFirestoreAdmin());
    const cards = [];
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

      cards.push(...page);
      offset += page.length;
    }

    await db.batchSet(cards);

    return handleJsonResponse({
      updatedCards: cards.length,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

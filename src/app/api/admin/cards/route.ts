import { AdminRole } from '@/entities/AdminRole';
import { VersionedCard } from '@/entities/Card';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { invalidateCardSoon } from '@/server/cache/card.cache';
import { CardDB } from '@/server/db/card.db';
import { authenticateUser, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

export async function POST(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });
    const body = await req.json();
    const card = body.card as VersionedCard;
    const db = new CardDB(firestoreAdmin);
    if (!card.id) {
      card.id = await db.generateId(card.isSample);
    }
    const updatedCard = await db.set(card);
    await invalidateCardSoon(card.id, card.version);
    return handleJsonResponse({ card: updatedCard });
  } catch (e) {
    return handleRouteError(e);
  }
}

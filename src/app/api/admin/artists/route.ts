import { AdminRole } from '@/entities/AdminRole';
import { Artist } from '@/entities/Artist';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { invalidateArtistSoon } from '@/server/cache/artist.cache';
import { ArtistDB } from '@/server/db/artist.db';
import { authenticateUser, handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

export async function POST(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });
    const body = await req.json();
    const artist = body.artist as Artist;
    const db = new ArtistDB(firestoreAdmin);
    if (!artist.id) {
      artist.id = await db.generateId();
    }
    const updatedArtist = await db.set(artist);
    await invalidateArtistSoon(artist.id);
    return handleJsonResponse({ artist: updatedArtist });
  } catch (e) {
    return handleRouteError(e);
  }
}

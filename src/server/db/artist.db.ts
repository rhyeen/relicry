import 'server-only';
import { RootDB } from './root.db';
import { Artist } from '@/entities/Artist';
import { conformId } from '@/lib/firestoreConform';

export class ArtistDB extends RootDB<Artist> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'artists');
  }

  public getFromParts(id: string): Promise<Artist | null> {
    return this.get(id);
  }

  protected getDocId(item: Artist): string {
    return conformId(item.id);
  }
}

import 'server-only';
import { RootDB } from './root.db';
import { Artist, getArtistId } from '@/entities/Artist';

export class ArtistDB extends RootDB<Artist> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'artists');
  }

  protected prefixId(id: string): string {
    return getArtistId(id);
  }

  public getFromParts(id: string): Promise<Artist | null> {
    return this.get(id);
  }

  protected getUnsafeDocId(item: Artist): string {
    return item.id
  }
}

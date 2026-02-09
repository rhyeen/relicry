import 'server-only';
import { Art, generateArtId, getArtId } from '@/entities/Art';
import { RootDB } from './root.db';

export class ArtDB extends RootDB<Art> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'arts');
  }

  protected prefixId(id: string): string {
    return getArtId(id);
  }

  public getFromParts(id: string): Promise<Art | null> {
    return this.get(id);
  }

  protected getUnsafeDocId(item: Art): string {
    return item.id;
  }

  public async generateId(): Promise<string> {
    return this.getUniqueId(generateArtId);
  }
}

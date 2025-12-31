import 'server-only';
import { Art } from '@/entities/Art';
import { RootDB } from './root.db';
import { conformId } from '@/lib/firestoreConform';

export class ArtDB extends RootDB<Art> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'arts');
  }

  public getFromParts(id: string): Promise<Art | null> {
    return this.get(id);
  }

  protected getDocId(item: Art): string {
    return conformId(item.id);
  }
}

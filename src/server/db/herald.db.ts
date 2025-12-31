import 'server-only';
import { Herald } from '@/entities/Herald';
import { RootDB } from './root.db';
import { conformId } from '@/lib/firestoreConform';

export class HeraldDB extends RootDB<Herald> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'heralds');
  }

  public getFromParts(id: string): Promise<Herald | null> {
    return this.get(id);
  }

  protected getDocId(item: Herald): string {
    return conformId(item.id);
  }
}

import 'server-only';
import { getHeraldId, Herald } from '@/entities/Herald';
import { RootDB } from './root.db';

export class HeraldDB extends RootDB<Herald> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'heralds');
  }

  protected prefixId(id: string): string {
    return getHeraldId(id);
  }

  public getFromParts(id: string): Promise<Herald | null> {
    return this.get(id);
  }

  protected getUnsafeDocId(item: Herald): string {
    return getHeraldId(item.id);
  }
}

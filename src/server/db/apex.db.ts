import 'server-only';
import { RootDB } from './root.db';
import { getApexDocId, getApexId, StoredApex } from '@/entities/Apex';

export class ApexDB extends RootDB<StoredApex> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'apex');
  }

  protected prefixId(id: string): string {
    return getApexId(id);
  }

  public getFromParts(id: string, version: number): Promise<StoredApex | null> {
    return this.get(getApexDocId(id, version));
  }

  protected getUnsafeDocId(item: StoredApex): string {
    return getApexDocId(item.id, item.version);
  }
}

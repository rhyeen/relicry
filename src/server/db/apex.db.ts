import 'server-only';
import { RootDB } from './root.db';
import { getApexDocId, StoredApex } from '@/entities/Apex';
import { conformId } from '@/lib/firestoreConform';

export class ApexDB extends RootDB<StoredApex> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'apex');
  }

  public getFromParts(id: string, version: number): Promise<StoredApex | null> {
    return this.get(getApexDocId(id, version));
  }

  protected getDocId(item: StoredApex): string {
    return conformId(getApexDocId(item.id, item.version));
  }
}

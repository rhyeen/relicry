import 'server-only';
import { PromotedItem } from '@/entities/PromotedItem';
import { RootDB } from './root.db';
import { conformId } from '@/lib/firestoreConform';

export class PromotedItemDB extends RootDB<PromotedItem> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'promotedItems');
  }

  public getFromParts(id: string): Promise<PromotedItem | null> {
    return this.get(id);
  }

  protected getDocId(item: PromotedItem): string {
    return conformId(item.id);
  }
}
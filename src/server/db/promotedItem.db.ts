import 'server-only';
import { getPromotedItemId, PromotedItem } from '@/entities/PromotedItem';
import { RootDB } from './root.db';

export class PromotedItemDB extends RootDB<PromotedItem> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'promotedItems');
  }

  protected prefixId(id: string): string {
    return getPromotedItemId(id);
  }

  public getFromParts(id: string): Promise<PromotedItem | null> {
    return this.get(id);
  }

  protected getUnsafeDocId(item: PromotedItem): string {
    return item.id;
  }
}
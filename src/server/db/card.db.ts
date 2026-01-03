import 'server-only';
import { RootDB, WhereValue } from './root.db';
import { getCardDocId, getCardId, VersionedCard } from '@/entities/Card';

export class CardDB extends RootDB<VersionedCard> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'cards');
  }

  protected prefixId(id: string): string {
    return getCardId(id);
  }
  
  public getFromParts(id: string, version: number): Promise<VersionedCard | null> {
    return this.get(getCardDocId(id, version));
  }

  public async getBy(
    where: { field: string; op: FirebaseFirestore.WhereFilterOp; value: WhereValue }[],
    sortBy: { field: string; direction: FirebaseFirestore.OrderByDirection },
    limit?: number,
  ): Promise<VersionedCard[]> {
    let query: FirebaseFirestore.Query = this.firestoreAdmin.collection(this.collectionName);

    where.forEach((condition) => {
      query = query.where(condition.field, condition.op, this.conformWhereValue(condition.value));
    });

    query = query.orderBy(sortBy.field, sortBy.direction);

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const querySnapshot = await query.get();
    return querySnapshot.docs.map((doc) => this.conformData(doc.data()) as VersionedCard);
  }

  protected getUnsafeDocId(item: VersionedCard): string {
    return getCardDocId(item.id, item.version);
  }
}
import 'server-only';
import { RootDB, WhereValue } from './root.db';
import { getCardDocId, VersionedCard } from '@/entities/Card';
import { conformId } from '@/lib/firestoreConform';

export class CardDB extends RootDB<VersionedCard> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'cards');
  }

  public getFromParts(id: string, version: number): Promise<VersionedCard | null> {
    return this.get(getCardDocId(id, version));
  }

  public async getBy(
    where: { field: string; op: FirebaseFirestore.WhereFilterOp; value: WhereValue }[],
    sortBy: { field: string; direction: FirebaseFirestore.OrderByDirection }[],
    limit?: number,
  ): Promise<VersionedCard[]> {
    let query: FirebaseFirestore.Query = this.firestoreAdmin.collection(this.collectionName);

    where.forEach((condition) => {
      query = query.where(condition.field, condition.op, this.conformWhereValue(condition.value));
    });

    sortBy.forEach((sort) => {
      query = query.orderBy(sort.field, sort.direction);
    });

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const querySnapshot = await query.get();
    return querySnapshot.docs.map((doc) => doc.data() as VersionedCard);
  }

  protected getDocId(item: VersionedCard): string {
    return conformId(getCardDocId(item.id, item.version));
  }
}
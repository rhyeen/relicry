import { conformId } from '@/lib/firestoreConform';

export type WhereValue = string | number | boolean | Date;

export abstract class RootDB<T extends { [key: string]: unknown }> {
  protected firestoreAdmin: FirebaseFirestore.Firestore;
  public readonly collectionName: string;
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
    collectionName: string,
  ) {
    this.firestoreAdmin = firestoreAdmin;
    this.collectionName = collectionName;
  }

  public async batchSet(items: T[]): Promise<void> {
    const collection = this.firestoreAdmin.collection(this.collectionName);
    const batch = this.firestoreAdmin.batch();
    items.forEach((item) => {
      batch.set(collection.doc(conformId(this.getDocId(item))), item);
    });
    await batch.commit();
  }

  public refresh(item: T): Promise<T | null> {
    const docId = this.getDocId(item);
    return this.get(docId);
  }

  public get(docId: string): Promise<T | null> {
    return this.firestoreAdmin
      .collection(this.collectionName)
      .doc(conformId(docId))
      .get()
      .then((doc) => (doc.exists ? (doc.data() as T) : null));
  }

  public async delete(docId: string): Promise<void> {
    await this.firestoreAdmin
      .collection(this.collectionName)
      .doc(conformId(docId))
      .delete();
  }

  public async set(item: T): Promise<T> {
    if (item.updatedAt) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item as any).updatedAt = new Date();
    }
    await this.firestoreAdmin
      .collection(this.collectionName)
      .doc(conformId(this.getDocId(item)))
      .set(item);
    return item;
  }

  public async update(docId: string, data: Partial<T>): Promise<void> {
    if (data.updatedAt) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any).updatedAt = new Date();
    }
    await this.firestoreAdmin
      .collection(this.collectionName)
      .doc(conformId(docId))
      .update(data);
  }

  protected abstract getDocId(item: T): string;

  public abstract getFromParts(...parts: unknown[]): Promise<T | null>;

  protected conformWhereValue(value: WhereValue): string | number | boolean | FirebaseFirestore.Timestamp {
    if (value instanceof Date) {
      return FirebaseFirestore.Timestamp.fromDate(value);
    }
    return value;
  }
}
import { conformDocId } from '@/lib/firestoreConform';
import { DocumentData, Firestore, GeoPoint, Timestamp } from 'firebase-admin/firestore';

export type WhereValue = string | number | boolean | Date;

export abstract class RootDB<T extends { [key: string]: unknown }> {
  protected firestoreAdmin: Firestore;
  public readonly collectionName: string;
  constructor(
    firestoreAdmin: Firestore,
    collectionName: string,
  ) {
    this.firestoreAdmin = firestoreAdmin;
    this.collectionName = collectionName;
  }

  /**
   * Many ids may only contain the unique portion, if so, prefix it here.
   */
  protected abstract prefixId(id: string): string;

  public async batchSet(items: T[]): Promise<void> {
    if (items.length === 0) return;
    const collection = this.firestoreAdmin.collection(this.collectionName);
    const batch = this.firestoreAdmin.batch();
    items.forEach((item) => {
      batch.set(
        collection.doc(conformDocId(this.prefixId(this.getUnsafeDocId(item)))),
        this.conformItemSet(item)
      );
    });
    await batch.commit();
  }

  /**
   * Can be used to adjust the item before sending it to the database.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected conformItemSet(item: T): any {
    return item;
  }

  /**
   * Can be used to adjust the item before retrieving it from the database.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected conformItemGet(item: any): T {
    return item;
  }

  public async batchDelete(docIds: string[]): Promise<void> {
    if (docIds.length === 0) return;
    const collection = this.firestoreAdmin.collection(this.collectionName);
    const batch = this.firestoreAdmin.batch();
    docIds.forEach((docId) => {
      batch.delete(collection.doc(conformDocId(this.prefixId(docId))));
    });
    await batch.commit();
  }

  public refresh(item: T): Promise<T | null> {
    return this.get(this.getUnsafeDocId(item));
  }

  /**
   * Generate a unique id using the provided generator function.
   * Note that this does not reserve the id, so to avoid collisions,
   * the caller should set the item immediately after receiving the id.
   */
  protected async getUniqueId(
    idGenerator: () => string,
  ): Promise<string> {
    let id: string;
    let exists: boolean;
    do {
      id = idGenerator();
      const doc = await this.firestoreAdmin
        .collection(this.collectionName)
        .doc(conformDocId(this.prefixId(id)))
        .get();
      exists = doc.exists;
    } while (exists);
    return id;
  }

  public get(docId: string): Promise<T | null> {
    return this.firestoreAdmin
      .collection(this.collectionName)
      .doc(conformDocId(this.prefixId((docId))))
      .get()
      .then((doc) => (doc.exists ?
        (this.conformItemGet(this.conformData(doc.data()) as T)) : null));
  }

  public async delete(docId: string): Promise<void> {
    await this.firestoreAdmin
      .collection(this.collectionName)
      .doc(conformDocId(this.prefixId(docId)))
      .delete();
  }

  public async set(item: T): Promise<T> {
    if (item.updatedAt) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item as any).updatedAt = new Date();
    }
    await this.firestoreAdmin
      .collection(this.collectionName)
      .doc(conformDocId(this.prefixId(this.getUnsafeDocId(item))))
      .set(this.conformItemSet(item));
    return item;
  }

  public async update(docId: string, data: Partial<T>): Promise<void> {
    if (data.updatedAt) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any).updatedAt = new Date();
    }
    await this.firestoreAdmin
      .collection(this.collectionName)
      .doc(conformDocId(this.prefixId(docId)))
      .update(data);
  }

  protected abstract getUnsafeDocId(item: T): string;

  public abstract getFromParts(...parts: unknown[]): Promise<T | null>;

  protected conformWhereValue(value: WhereValue): string | number | boolean | FirebaseFirestore.Timestamp {
    if (value instanceof Date) {
      return Timestamp.fromDate(value);
    }
    return value;
  }

  public async getBy(params: {
    where: { field: string; op: FirebaseFirestore.WhereFilterOp; value: WhereValue }[];
    sortBy?: { field: string; direction: FirebaseFirestore.OrderByDirection };
    limit?: number,
  }): Promise<T[]> {
    let query: FirebaseFirestore.Query = this.firestoreAdmin.collection(this.collectionName);
    params.where.forEach((condition) => {
      query = query.where(condition.field, condition.op, this.conformWhereValue(condition.value));
    });
    if (params.sortBy) {
      query = query.orderBy(params.sortBy.field, params.sortBy.direction);
    }
    if (params.limit !== undefined) {
      query = query.limit(params.limit);
    }
    const querySnapshot = await query.get();
    return querySnapshot.docs.map((doc) => this.conformItemGet(this.conformData(doc.data()) as T));
  }

  protected conformData(data: DocumentData | undefined): Record<string, unknown> {
    const seen = new WeakMap<object, unknown>();

    const isPlainObject = (v: unknown): v is Record<string, unknown> => {
      if (v === null || typeof v !== 'object') return false;
      const proto = Object.getPrototypeOf(v);
      return proto === Object.prototype || proto === null;
    };

    const toBase64 = (u8: Uint8Array) =>
      typeof Buffer !== 'undefined' ? Buffer.from(u8).toString('base64') : Array.from(u8).join(',');

    const convertToJson = (value: unknown): unknown => {
      // Firestore Timestamp -> ISO string (JSON-safe)
      if (value instanceof Timestamp) {
        // return value.toDate().toISOString();
        // If you'd rather return Date objects (not JSON-safe unless serialized later):
        return value.toDate();
      }

      // Firestore GeoPoint -> plain object
      if (value instanceof GeoPoint) {
        return { latitude: value.latitude, longitude: value.longitude };
      }

      // Date -> ISO string (optional, but makes output consistently JSON-safe)
      if (value instanceof Date) {
        // return value.toISOString();
        // If you'd rather return Date objects (not JSON-safe unless serialized later):
        return value;
      }

      // DocumentReference-ish -> path string
      if (value && typeof value === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj = value as any;

        if (typeof obj.path === 'string' && typeof obj.id === 'string' && typeof obj.parent === 'object') {
          return obj.path as string;
        }

        // FieldValue-ish (shouldn't usually appear in reads) — choose behavior:
        // Option 1: return as-is
        if (typeof obj._methodName === 'string') {
          return value;
        }

        // Binary / bytes
        if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
          return value.toString('base64');
        }
        if (value instanceof Uint8Array) {
          return toBase64(value);
        }
      }

      // Arrays: deep convert
      if (Array.isArray(value)) {
        if (seen.has(value)) return seen.get(value);
        const out: unknown[] = [];
        seen.set(value, out);
        for (const item of value) out.push(convertToJson(item));
        return out;
      }

      // Plain objects: deep convert
      if (isPlainObject(value)) {
        if (seen.has(value)) return seen.get(value);
        const out: Record<string, unknown> = {};
        seen.set(value, out);
        for (const [k, v] of Object.entries(value)) out[k] = convertToJson(v);
        return out;
      }

      // Everything else: leave as-is
      return value;
    };

    // Ensure we always return an object
    return (data ? (convertToJson(data) as Record<string, unknown>) : {});
  }
}
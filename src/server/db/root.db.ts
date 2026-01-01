import { conformId } from '@/lib/firestoreConform';
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
      .then((doc) => (doc.exists ? (this.conformData(doc.data()) as T) : null));
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
      return Timestamp.fromDate(value);
    }
    return value;
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
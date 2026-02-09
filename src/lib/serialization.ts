// src/entities/serialization.ts
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };

/**
 * Recursively converts Date -> string (ISO) for DTOs.
 */
export type SerializeDates<T> =
  T extends Date ? string :
  T extends (infer U)[] ? SerializeDates<U>[] :
  T extends object ? { [K in keyof T]: SerializeDates<T[K]> } :
  T;

/**
 * Firestore Admin returns Timestamp-ish objects with toDate()
 */
export function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (value && typeof value === "object" && "toDate" in value && typeof (value as any).toDate === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (value as any).toDate();
  }
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  throw new Error(`Cannot convert to Date: ${String(value)}`);
}

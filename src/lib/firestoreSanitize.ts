function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        const cleaned = stripUndefinedDeep(item);
        return cleaned === undefined ? [] : [cleaned];
      }) as T;
  }

  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const cleaned = stripUndefinedDeep(item);
      if (cleaned !== undefined) {
        out[key] = cleaned;
      }
    }
    return out as T;
  }

  return value;
}

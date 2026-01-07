export interface StoredRoot {
  [key: string]: unknown;
}

export function prefixId(prefix: string, id: string): string {
  let _prefix = prefix;
  if (_prefix && !_prefix.endsWith('/')) {
    _prefix += '/';
  }
  if (_prefix && !id.startsWith(_prefix)) {
    return _prefix + id;
  }
  return id;
}

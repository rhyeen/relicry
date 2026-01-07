export function conformDocId(id: string): string {
  return id.replace(/\s+/g, '').toLowerCase().replace(/\//g, '.');
}
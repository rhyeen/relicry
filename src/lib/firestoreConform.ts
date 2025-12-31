export function conformId(id: string): string {
  return id.replace(/\s+/g, '').toLowerCase().replace(/\//g, '.');
}
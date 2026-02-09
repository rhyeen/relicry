import { randomFillSync } from 'crypto';

/**
 * For collision probabilty, see https://devina.io/collision-calculator
 */
export function generateId(n: number): string {
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid length: ${n}`);
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(n);
  randomFillSync(bytes);
  let out = '';
  for (let i = 0; i < n; i++) out += chars[bytes[i] % chars.length];
  return out;
}

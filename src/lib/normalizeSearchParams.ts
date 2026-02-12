import { CardSize } from '@/entities/CardContext';
import { SearchParams } from 'next/dist/server/request/search-params';
import { ReadonlyURLSearchParams } from 'next/navigation';

export function normalizeSizeSP(sp?: SearchParams | ReadonlyURLSearchParams): CardSize | undefined {
  if (!sp) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let size = (sp as any).size || null;
  if (typeof sp.get === 'function') {
    size = sp.get('size');
  }
  const v = Array.isArray(size) ? size[0] : size;
  if (!v) return undefined;
  const allowed = new Set([CardSize.PrintSize, CardSize.WebSize]);
  if (!allowed.has(v as CardSize)) return undefined;
  return v as CardSize;
}

export function normalizeAwakenedSP(sp?: SearchParams | ReadonlyURLSearchParams): boolean {
  if (!sp) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let awakened = (sp as any).awakened || null;
  if (typeof sp.get === 'function') {
    awakened = sp.get('awakened');
  }
  const v = Array.isArray(awakened) ? awakened[0] : awakened;
  if (!v) return false;
  return v === 'true';
}
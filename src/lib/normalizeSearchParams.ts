import { CardSize } from '@/entities/CardContext';
import { SearchParams } from 'next/dist/server/request/search-params';
import { ReadonlyURLSearchParams } from 'next/navigation';

export function normalizeSizeSP(sp?: SearchParams | ReadonlyURLSearchParams): CardSize | undefined {
  if (!sp) return undefined;
  let size = sp.size || null;
  if (typeof sp.get === 'function') {
    size = sp.get('size');
  }
  const v = Array.isArray(size) ? size[0] : size;
  if (!v) return undefined;
  const allowed = new Set([CardSize.PrintSize, CardSize.WebSize]);
  if (!allowed.has(v as CardSize)) return undefined;
  return v as CardSize;
}

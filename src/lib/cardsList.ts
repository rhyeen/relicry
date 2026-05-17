import { Aspect } from '@/entities/Aspect';
import { VersionedCard } from '@/entities/Card';
import { decodeCardsHistoryEntry, encodeCardsHistoryEntry } from '@/lib/cardQueryFields';
import type { ReadonlyURLSearchParams } from 'next/navigation';

export const CARDS_PAGE_SIZE = 24;

export type CardListTypeFilter = 'all' | VersionedCard['type'];
export type CardListAspectFilter = 'all' | Aspect | 'dual';

export type CardListFilters = {
  query: string;
  type: CardListTypeFilter;
  aspect: CardListAspectFilter;
  cursor: string | null;
  history: (string | null)[];
};

export type CollectionCardScope = 'collection' | 'all';

export type CollectionCardFilters = CardListFilters & {
  scope: CollectionCardScope;
};

export const DEFAULT_CARDS_FILTERS: CardListFilters = {
  query: '',
  type: 'all',
  aspect: 'all',
  cursor: null,
  history: [],
};

export const DEFAULT_COLLECTION_FILTERS: CollectionCardFilters = {
  ...DEFAULT_CARDS_FILTERS,
  scope: 'collection',
};

export function parseCardsFilters(
  searchParams?: Record<string, string | string[] | undefined> | URLSearchParams | ReadonlyURLSearchParams,
): CardListFilters {
  const query = readSearchParam(searchParams, 'query')?.trim() ?? '';
  const type = parseTypeFilter(readSearchParam(searchParams, 'type'));
  const aspect = parseAspectFilter(readSearchParam(searchParams, 'aspect'));
  const cursor = readSearchParam(searchParams, 'cursor')?.trim() || null;
  const history = parseHistory(readSearchParam(searchParams, 'history'));

  return {
    query,
    type,
    aspect,
    cursor,
    history,
  };
}

export function parseCollectionFilters(
  searchParams?: Record<string, string | string[] | undefined> | URLSearchParams | ReadonlyURLSearchParams,
): CollectionCardFilters {
  return {
    ...parseCardsFilters(searchParams),
    scope: parseCollectionScope(readSearchParam(searchParams, 'scope')),
  };
}

export function buildCardsQueryString(filters: Partial<CardListFilters>): string {
  const params = new URLSearchParams();

  if (filters.query?.trim()) {
    params.set('query', filters.query.trim());
  }
  if (filters.type && filters.type !== 'all') {
    params.set('type', filters.type);
  }
  if (filters.aspect && filters.aspect !== 'all') {
    params.set('aspect', filters.aspect);
  }
  if (filters.cursor) {
    params.set('cursor', filters.cursor);
  }
  if (filters.history && filters.history.length > 0) {
    params.set('history', filters.history.map(encodeCardsHistoryEntry).join(','));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function buildCollectionQueryString(filters: Partial<CollectionCardFilters>): string {
  const params = new URLSearchParams(buildCardsQueryString(filters).replace(/^\?/, ''));

  if (filters.scope && filters.scope !== DEFAULT_COLLECTION_FILTERS.scope) {
    params.set('scope', filters.scope);
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function getCardsPageNumber(filters: CardListFilters): number {
  return filters.history.length + 1;
}

export function areCardsFiltersEqual(left: CardListFilters, right: CardListFilters): boolean {
  return left.query === right.query
    && left.type === right.type
    && left.aspect === right.aspect
    && left.cursor === right.cursor
    && left.history.length === right.history.length
    && left.history.every((value, index) => value === right.history[index]);
}

export function areCollectionFiltersEqual(left: CollectionCardFilters, right: CollectionCardFilters): boolean {
  return left.scope === right.scope && areCardsFiltersEqual(left, right);
}

export function hasActiveCardsFilters(filters: CardListFilters): boolean {
  return !areCardsFiltersEqual(filters, DEFAULT_CARDS_FILTERS);
}

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined> | URLSearchParams | ReadonlyURLSearchParams | undefined,
  key: string,
): string | undefined {
  if (!searchParams) {
    return undefined;
  }

  if (typeof searchParams === 'object' && 'get' in searchParams && typeof searchParams.get === 'function') {
    return searchParams.get(key) ?? undefined;
  }

  const value = (searchParams as Record<string, string | string[] | undefined>)[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseTypeFilter(value: string | undefined): CardListTypeFilter {
  if (value === 'deck' || value === 'focus' || value === 'gambit') {
    return value;
  }
  return 'all';
}

function parseAspectFilter(value: string | undefined): CardListAspectFilter {
  if (value === 'dual') {
    return value;
  }
  if (value && Object.values(Aspect).includes(value as Aspect) && value !== Aspect.Gambit) {
    return value as Aspect;
  }
  return 'all';
}

function parseCollectionScope(value: string | undefined): CollectionCardScope {
  return value === 'all' ? 'all' : 'collection';
}

function parseHistory(value: string | undefined): (string | null)[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(decodeCardsHistoryEntry);
}

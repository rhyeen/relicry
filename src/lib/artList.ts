import type { Art } from '@/entities/Art';
import { decodeCardsHistoryEntry, encodeCardsHistoryEntry } from '@/lib/cardQueryFields';
import { normalizeSearchQuery } from '@/lib/searchQueryFields';
import type { ReadonlyURLSearchParams } from 'next/navigation';

export const ART_PAGE_SIZE = 24;

export type ArtListTypeFilter = 'all' | Art['type'];
export type ArtListGenerationFilter = 'all' | 'ai' | 'original';

export type ArtListFilters = {
  query: string;
  type: ArtListTypeFilter;
  generation: ArtListGenerationFilter;
  cursor: string | null;
  history: (string | null)[];
};

export const DEFAULT_ART_FILTERS: ArtListFilters = {
  query: '',
  type: 'all',
  generation: 'all',
  cursor: null,
  history: [],
};

export function parseArtFilters(
  searchParams?: Record<string, string | string[] | undefined> | URLSearchParams | ReadonlyURLSearchParams,
): ArtListFilters {
  return {
    query: readSearchParam(searchParams, 'query')?.trim() ?? '',
    type: parseTypeFilter(readSearchParam(searchParams, 'type')),
    generation: parseGenerationFilter(readSearchParam(searchParams, 'generation')),
    cursor: readSearchParam(searchParams, 'cursor')?.trim() || null,
    history: parseHistory(readSearchParam(searchParams, 'history')),
  };
}

export function buildArtQueryString(filters: Partial<ArtListFilters>): string {
  const params = new URLSearchParams();

  if (filters.query?.trim()) {
    params.set('query', filters.query.trim());
  }
  if (filters.type && filters.type !== 'all') {
    params.set('type', filters.type);
  }
  if (filters.generation && filters.generation !== 'all') {
    params.set('generation', filters.generation);
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

export function areArtFiltersEqual(left: ArtListFilters, right: ArtListFilters): boolean {
  return left.query === right.query
    && left.type === right.type
    && left.generation === right.generation
    && left.cursor === right.cursor
    && left.history.length === right.history.length
    && left.history.every((value, index) => value === right.history[index]);
}

export function getArtPageNumber(filters: ArtListFilters): number {
  return filters.history.length + 1;
}

export function parseArtSearchQuery(query: string): {
  artIds: string[];
  artistIds: string[];
  idOnly: boolean;
  normalizedText: string;
} {
  const trimmed = query.trim().toLowerCase();

  if (trimmed.startsWith('art/')) {
    return {
      artIds: [trimmed],
      artistIds: [],
      idOnly: true,
      normalizedText: '',
    };
  }

  if (trimmed.startsWith('ast/')) {
    return {
      artIds: [],
      artistIds: [trimmed],
      idOnly: true,
      normalizedText: '',
    };
  }

  const canBeBareArtOrArtistId = trimmed.length === 10 && !/\s/.test(trimmed);

  return {
    artIds: canBeBareArtOrArtistId ? [`art/${trimmed}`] : [],
    artistIds: canBeBareArtOrArtistId ? [`ast/${trimmed}`] : [],
    idOnly: false,
    normalizedText: normalizeArtSearchText(query),
  };
}

export function normalizeArtSearchText(query: string): string {
  return normalizeSearchQuery(query);
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

function parseTypeFilter(value: string | undefined): ArtListTypeFilter {
  if (value === 'illustration' || value === 'writing') {
    return value;
  }
  return 'all';
}

function parseGenerationFilter(value: string | undefined): ArtListGenerationFilter {
  if (value === 'ai' || value === 'original') {
    return value;
  }
  return 'all';
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

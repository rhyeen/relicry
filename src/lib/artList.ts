import type { Art } from '@/entities/Art';
import { normalizeSearchQuery } from '@/lib/searchQueryFields';
import type { ReadonlyURLSearchParams } from 'next/navigation';

export const ART_PAGE_SIZE = 22;

export type ArtListTypeFilter = 'all' | Art['type'];
export type ArtListGenerationFilter = 'all' | 'ai' | 'original';

export type ArtListFilters = {
  query: string;
  artistId: string;
  type: ArtListTypeFilter;
  generation: ArtListGenerationFilter;
  page: number;
};

export const DEFAULT_ART_FILTERS: ArtListFilters = {
  query: '',
  artistId: '',
  type: 'all',
  generation: 'all',
  page: 1,
};

export function parseArtFilters(
  searchParams?: Record<string, string | string[] | undefined> | URLSearchParams | ReadonlyURLSearchParams,
): ArtListFilters {
  return {
    query: readSearchParam(searchParams, 'query')?.trim() ?? '',
    artistId: normalizeArtistIdFilter(readSearchParam(searchParams, 'artistId')),
    type: parseTypeFilter(readSearchParam(searchParams, 'type')),
    generation: parseGenerationFilter(readSearchParam(searchParams, 'generation')),
    page: parsePage(readSearchParam(searchParams, 'page')),
  };
}

export function buildArtQueryString(filters: Partial<ArtListFilters>): string {
  const params = new URLSearchParams();

  if (filters.query?.trim()) {
    params.set('query', filters.query.trim());
  }
  if (filters.artistId?.trim()) {
    params.set('artistId', normalizeArtistIdFilter(filters.artistId));
  }
  if (filters.type && filters.type !== 'all') {
    params.set('type', filters.type);
  }
  if (filters.generation && filters.generation !== 'all') {
    params.set('generation', filters.generation);
  }
  if (filters.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function areArtFiltersEqual(left: ArtListFilters, right: ArtListFilters): boolean {
  return left.query === right.query
    && left.artistId === right.artistId
    && left.type === right.type
    && left.generation === right.generation
    && left.page === right.page;
}

export function getArtPageNumber(filters: ArtListFilters): number {
  return filters.page;
}

export function hasActiveArtFilters(filters: ArtListFilters): boolean {
  return !!filters.query.trim()
    || !!filters.artistId.trim()
    || filters.type !== 'all'
    || filters.generation !== 'all';
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

function normalizeArtistIdFilter(value: string | undefined): string {
  const trimmed = value?.trim().toLowerCase() ?? '';
  if (!trimmed) {
    return '';
  }
  if (trimmed.startsWith('ast/')) {
    return trimmed;
  }
  if (trimmed.length === 10 && !/\s|\//.test(trimmed)) {
    return `ast/${trimmed}`;
  }
  return trimmed;
}

function parsePage(value: string | undefined): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

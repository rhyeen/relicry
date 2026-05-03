import { Aspect } from '@/entities/Aspect';
import { VersionedCard } from '@/entities/Card';

export const CARDS_PAGE_SIZE = 24;

export type CardListTypeFilter = 'all' | VersionedCard['type'];
export type CardListAspectFilter = 'all' | Aspect | 'dual';

export type CardListFilters = {
  page: number;
  query: string;
  type: CardListTypeFilter;
  aspect: CardListAspectFilter;
};

export type CardListResult = {
  cards: VersionedCard[];
  totalCards: number;
  page: number;
  totalPages: number;
};

export function parseCardsFilters(
  searchParams?: Record<string, string | string[] | undefined>,
): CardListFilters {
  const query = readSingle(searchParams?.query)?.trim() ?? '';
  const page = parsePositiveInteger(readSingle(searchParams?.page));
  const type = parseTypeFilter(readSingle(searchParams?.type));
  const aspect = parseAspectFilter(readSingle(searchParams?.aspect));

  return {
    page,
    query,
    type,
    aspect,
  };
}

export function filterAndPaginateCards(
  cards: VersionedCard[],
  filters: CardListFilters,
): CardListResult {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const filtered = cards.filter((card) => {
    if (filters.type !== 'all' && card.type !== filters.type) {
      return false;
    }

    if (normalizedQuery && !card.title.toLowerCase().includes(normalizedQuery)) {
      return false;
    }

    if (filters.aspect === 'all') {
      return true;
    }

    if (card.type === 'gambit') {
      return false;
    }

    const aspects = normalizeCardAspects(card.aspect);
    if (filters.aspect === 'dual') {
      return aspects.length === 2;
    }

    return aspects.includes(filters.aspect);
  });

  const totalCards = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCards / CARDS_PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const start = (page - 1) * CARDS_PAGE_SIZE;

  return {
    cards: filtered.slice(start, start + CARDS_PAGE_SIZE),
    totalCards,
    page,
    totalPages,
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
  if (filters.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

function readSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInteger(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
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

function normalizeCardAspects(aspect: Aspect | [Aspect, Aspect]): Aspect[] {
  return Array.isArray(aspect) ? [...aspect] : [aspect];
}

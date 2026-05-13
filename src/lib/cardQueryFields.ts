import { Aspect } from '@/entities/Aspect';
import { getCardId } from '@/entities/Card';
import type { CardListAspectFilter } from '@/lib/cardsList';
import { buildSearchPrefixes, normalizeSearchQuery } from '@/lib/searchQueryFields';

const FILTERABLE_ASPECTS = [Aspect.Brave, Aspect.Cunning, Aspect.Wise, Aspect.Charming] as const;
type FilterableAspect = typeof FILTERABLE_ASPECTS[number];
const ROOT_CURSOR_TOKEN = '__root__';

export function normalizeCardTitleQuery(query: string): string {
  return normalizeSearchQuery(query);
}

export function buildCardTitlePrefixes(title: string): string[] {
  return buildSearchPrefixes(title);
}

export function parseCardSearchQuery(query: string): {
  cardIds: string[];
  idOnly: boolean;
  normalizedTitle: string;
} {
  const trimmed = query.trim().toLowerCase();

  if (trimmed.startsWith('c/')) {
    return {
      cardIds: [trimmed],
      idOnly: true,
      normalizedTitle: '',
    };
  }

  const normalizedTitle = normalizeCardTitleQuery(query);
  const canBeBareCardId = trimmed.length > 0
    && !/\s/.test(trimmed)
    && (trimmed.length === 4 || trimmed.length === 12);

  return {
    cardIds: canBeBareCardId ? [getCardId(trimmed)] : [],
    idOnly: false,
    normalizedTitle,
  };
}

export function buildCardAspectKey(aspect: Aspect | [Aspect, Aspect] | undefined): string | null {
  if (!aspect) {
    return null;
  }

  if (Array.isArray(aspect)) {
    if (!aspect.every(isFilterableAspect)) {
      return null;
    }
    const [first, second] = normalizeAspectPair(aspect as [FilterableAspect, FilterableAspect]);
    return `${first}+${second}`;
  }

  if (!isFilterableAspect(aspect)) {
    return null;
  }

  return aspect;
}

export function buildAspectFilterKeys(filter: CardListAspectFilter): string[] {
  if (filter === 'all') {
    return [];
  }

  if (filter === 'dual') {
    return getDualAspectKeys();
  }

  return [
    filter,
    ...FILTERABLE_ASPECTS
      .filter((aspect) => aspect !== filter)
      .map((aspect) => buildCardAspectKey([filter, aspect] as [Aspect, Aspect]))
      .filter((key): key is string => Boolean(key)),
  ];
}

export function encodeCardsHistoryEntry(cursor: string | null): string {
  return cursor ?? ROOT_CURSOR_TOKEN;
}

export function decodeCardsHistoryEntry(value: string): string | null {
  return value === ROOT_CURSOR_TOKEN ? null : value;
}

function getDualAspectKeys(): string[] {
  const keys: string[] = [];

  for (let index = 0; index < FILTERABLE_ASPECTS.length; index += 1) {
    for (let secondIndex = index + 1; secondIndex < FILTERABLE_ASPECTS.length; secondIndex += 1) {
      const key = buildCardAspectKey([FILTERABLE_ASPECTS[index]!, FILTERABLE_ASPECTS[secondIndex]!]);
      if (key) {
        keys.push(key);
      }
    }
  }

  return keys;
}

function normalizeAspectPair(
  [first, second]: [FilterableAspect, FilterableAspect],
): [FilterableAspect, FilterableAspect] {
  return [first, second].sort((left, right) => FILTERABLE_ASPECTS.indexOf(left) - FILTERABLE_ASPECTS.indexOf(right)) as [FilterableAspect, FilterableAspect];
}

function isFilterableAspect(aspect: Aspect): aspect is FilterableAspect {
  return FILTERABLE_ASPECTS.includes(aspect as FilterableAspect);
}

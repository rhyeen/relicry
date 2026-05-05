import { Aspect } from '@/entities/Aspect';
import { CardListAspectFilter } from '@/lib/cardsList';

const FILTERABLE_ASPECTS = [Aspect.Brave, Aspect.Cunning, Aspect.Wise, Aspect.Charming] as const;
type FilterableAspect = typeof FILTERABLE_ASPECTS[number];
const ROOT_CURSOR_TOKEN = '__root__';

export function normalizeCardTitleQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildCardTitlePrefixes(title: string): string[] {
  const normalizedTitle = normalizeCardTitleQuery(title);
  if (!normalizedTitle) {
    return [];
  }

  const words = normalizedTitle.split(' ');
  const prefixes = new Set<string>();

  for (let start = 0; start < words.length; start += 1) {
    let phrase = '';
    for (let end = start; end < words.length; end += 1) {
      phrase = phrase ? `${phrase} ${words[end]}` : words[end]!;
      for (let prefixLength = 1; prefixLength <= phrase.length; prefixLength += 1) {
        prefixes.add(phrase.slice(0, prefixLength));
      }
    }
  }

  return [...prefixes];
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

export function normalizeSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildSearchPrefixes(value: string | undefined | null): string[] {
  const normalizedValue = normalizeSearchQuery(value ?? '');
  if (!normalizedValue) {
    return [];
  }

  const words = normalizedValue.split(' ');
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

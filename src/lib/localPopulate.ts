export const DEFAULT_LOCAL_CARD_COUNT = 3;
export const MAX_LOCAL_CARD_COUNT = 500;

export function normalizeLocalCardCount(value: unknown): number {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number.parseInt(value, 10)
      : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return DEFAULT_LOCAL_CARD_COUNT;
  }

  return Math.min(
    MAX_LOCAL_CARD_COUNT,
    Math.max(DEFAULT_LOCAL_CARD_COUNT, Math.floor(parsed)),
  );
}

export const DISPLAY_NAME_MAX_LENGTH = 80;

export const DISPLAY_NAME_MIN_LETTERS = 2;

export function normalizeDisplayName(displayName: string): string {
  return displayName.trim();
}

export function countDisplayNameLetters(displayName: string): number {
  return Array.from(displayName.matchAll(/\p{L}/gu)).length;
}

export function getDisplayNameValidationError(displayName: string): string | null {
  const normalizedDisplayName = normalizeDisplayName(displayName);

  if (!normalizedDisplayName) {
    return 'Enter a display name.';
  }

  if (normalizedDisplayName.length > DISPLAY_NAME_MAX_LENGTH) {
    return `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`;
  }

  if (countDisplayNameLetters(normalizedDisplayName) < DISPLAY_NAME_MIN_LETTERS) {
    return `Display name must contain at least ${DISPLAY_NAME_MIN_LETTERS} letters.`;
  }

  return null;
}

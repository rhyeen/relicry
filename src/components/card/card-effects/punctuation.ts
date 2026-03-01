const LEADING_PUNCTUATION_REGEX = /^[.,\/#!$%\^&\*;:{}=\-_`~()"]/;

/**
 * Returns true when a text token starts with punctuation.
 * This is used to pull delimiter-only tokens (e.g. "," or "\"") tight to the previous part.
 */
export function hasAttachedPunctuation(text: string): boolean {
  return LEADING_PUNCTUATION_REGEX.test(text);
}

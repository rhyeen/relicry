const PUNCTUATION_REGEX = /[.,\/#!$%\^&\*;:{}=\-_`~()"]/;

/**
 * Returns true when text contains punctuation that is attached to the
 * previous character (no whitespace before it).
 */
export function hasAttachedPunctuation(text: string): boolean {
  for (let i = 0; i < text.length; i += 1) {
    if (!PUNCTUATION_REGEX.test(text[i])) continue;
    if (i === 0) return true;
    if (!/\s/.test(text[i - 1])) return true;
  }
  return false;
}


import { describe, expect, it } from 'vitest';
import { canHaveCardSubtitle, getCardSubtitleError, getCardTitleError, requiresCardSubtitle, shouldPersistCardSubtitle } from '../CardValidation';
import { Rarity } from '../Rarity';

describe('card validation helpers', () => {
  it('allows gambits to have subtitles without requiring them', () => {
    const gambit = {
      type: 'gambit' as const,
      rarity: Rarity.Common,
      subTitle: '',
    };

    expect(canHaveCardSubtitle(gambit)).toBe(true);
    expect(requiresCardSubtitle(gambit)).toBe(false);
    expect(getCardSubtitleError(gambit)).toBeUndefined();
    expect(shouldPersistCardSubtitle(gambit)).toBe(false);
  });

  it('persists gambit subtitles when they are provided', () => {
    const gambit = {
      type: 'gambit' as const,
      rarity: Rarity.Common,
      subTitle: 'Opener',
    };

    expect(shouldPersistCardSubtitle(gambit)).toBe(true);
  });

  it('requires subtitles for epic and legendary non-gambits', () => {
    const card = {
      type: 'deck' as const,
      rarity: Rarity.Legendary,
      subTitle: '  ',
    };

    expect(requiresCardSubtitle(card)).toBe(true);
    expect(getCardSubtitleError(card)).toBe('Subtitle is required for Epic and Legendary cards.');
  });

  it('does not require subtitles for lower-rarity non-gambits', () => {
    const card = {
      type: 'focus' as const,
      rarity: Rarity.Rare,
      subTitle: undefined,
    };

    expect(requiresCardSubtitle(card)).toBe(false);
    expect(getCardSubtitleError(card)).toBeUndefined();
  });

  it('treats blank titles as invalid', () => {
    expect(getCardTitleError({ title: '   ' })).toBe('Title is required.');
    expect(getCardTitleError({ title: 'Valid title' })).toBeUndefined();
  });
});

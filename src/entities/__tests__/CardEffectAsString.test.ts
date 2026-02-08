// cardEffectString.test.ts
import { describe, expect, it } from 'vitest';
import { Aspect } from '../Aspect';
import { auraToString, conditionalToString, cardPartToString, cardEffectToString, stringToCardEffect } from '../CardEffectAsString';
import { Conditional } from '../Conditional';
import { CardEffect, CardEffectPart, CardEffectPartCard, CardEffectPartDamage, CardEffectPartTag, CardEffectPartText } from '../CardEffect';

describe('card effect string helpers', () => {
  it('auraToString() handles undefined, number, and range', () => {
    expect(auraToString(undefined)).toBe('');
    expect(auraToString(3)).toBe('AURA (3)');
    expect(auraToString({ from: 2, to: 5 })).toBe('AURA (2-5)');
  });

  it('conditionalToString() formats known conditionals', () => {
    expect(conditionalToString(Conditional.Pvp)).toBe('PVP?');
    expect(conditionalToString(Conditional.Solo)).toBe('SOLO?');
    expect(conditionalToString(Conditional.Infinite)).toBe('INF?');
    expect(conditionalToString(Conditional.React)).toBe('REACT');
    expect(conditionalToString(Conditional.TurnEnd)).toBe('TURNEND?');
    expect(conditionalToString(Conditional.DrawEnd)).toBe('DRAWEND?');
  });

  it('cardPartToString() formats all part types', () => {
    expect(cardPartToString({ type: 'text', text: 'HELLO' } as CardEffectPart)).toBe('HELLO');
    expect(cardPartToString({ type: 'damage', amount: 2 } as CardEffectPart)).toBe('2D');
    expect(cardPartToString({ type: 'quell', amount: 4 } as CardEffectPart)).toBe('4Q');

    expect(cardPartToString({ type: 'card' } as CardEffectPart)).toBe('C');
    expect(cardPartToString({ type: 'card', orMore: true } as CardEffectPart)).toBe('+C');
    expect(cardPartToString({ type: 'card', amount: 3 } as CardEffectPart)).toBe('3C');
    expect(cardPartToString({ type: 'card', amount: 3, orMore: true } as CardEffectPart)).toBe('3+C');

    expect(cardPartToString({ type: 'tag', tag: 'ability' } as CardEffectPart)).toBe('ABILITY');

    expect(cardPartToString({ type: 'aspect', aspect: Aspect.Brave } as CardEffectPart)).toBe('(R)');
    expect(cardPartToString({ type: 'aspect', aspect: Aspect.Cunning } as CardEffectPart)).toBe('(G)');
    expect(cardPartToString({ type: 'aspect', aspect: Aspect.Wise } as CardEffectPart)).toBe('(B)');
    expect(cardPartToString({ type: 'aspect', aspect: Aspect.Charming } as CardEffectPart)).toBe('(Y)');

    expect(cardPartToString({ type: 'flip' } as CardEffectPart)).toBe('FLIP');
    expect(cardPartToString({ type: 'scrapped' } as CardEffectPart)).toBe('SCRAPPED');
  });

  it('cardEffectToString() composes conditionals, aura, and parts', () => {
    const effect = {
      conditionals: [Conditional.Pvp, Conditional.TurnEnd],
      aura: { from: 1, to: 2 },
      parts: [
        { type: 'text', text: 'Deal' },
        { type: 'damage', amount: 3 },
        { type: 'flip' },
      ],
    } as CardEffect;

    expect(cardEffectToString(effect)).toBe('PVP? TURNEND? AURA (1-2) Deal 3D FLIP');
  });

  it('stringToCardEffect() parses conditionals, aura number, and parts', () => {
    const s = 'PVP? AURA (3) 2D FLIP';
    const e = stringToCardEffect(s);

    expect(e.conditionals).toEqual([Conditional.Pvp]);
    expect(e.aura).toBe(3);
    expect(e.parts.map((p) => p.type)).toEqual(['damage', 'flip']);
    expect((e.parts[0] as CardEffectPartDamage).amount).toBe(2);

    // Round-trip
    expect(cardEffectToString(e)).toBe(s);
  });

  it('stringToCardEffect() parses multi-token conditionals and aura range', () => {
    const s = 'SOLO? TURNEND? AURA (1-2) 1+C';
    const e = stringToCardEffect(s);

    expect(e.conditionals).toEqual([Conditional.Solo, Conditional.TurnEnd]);
    expect(e.aura).toEqual({ from: 1, to: 2 });
    expect(e.parts.length).toBe(1);
    expect((e.parts[0] as CardEffectPart).type).toBe('card');
    expect((e.parts[0] as CardEffectPartCard).amount).toBe(1);
    expect((e.parts[0] as CardEffectPartCard).orMore).toBe(true);

    expect(cardEffectToString(e)).toBe(s);
  });

  it('stringToCardEffect() treats unknown tokens as text and ALLCAPS as text', () => {
    const s = 'REACT AURA (1) ABILITY Deal 2D NOW';
    const e = stringToCardEffect(s);

    expect(e.conditionals).toEqual([Conditional.React]);
    expect(e.aura).toBe(1);

    // Parts: tag(ABILITY), text(Deal), damage(2D), text(NOW)
    expect(e.parts.map((p) => p.type)).toEqual(['tag', 'text', 'damage', 'text']);
    expect((e.parts[0] as CardEffectPartTag).tag).toBe('ability');
    expect((e.parts[3] as CardEffectPartText).text).toBe('NOW');

    expect(cardEffectToString(e)).toBe(s);
  });

  it('stringToCardEffect() treats known tag ALLCAPS as tags', () => {
    const s = 'REACT AURA (1) ABILITY Deal 2D WEAPON';
    const e = stringToCardEffect(s);

    expect(e.conditionals).toEqual([Conditional.React]);
    expect(e.aura).toBe(1);

    // Parts: tag(ABILITY), text(Deal), damage(2D), tag(DAMAGE)
    expect(e.parts.map((p) => p.type)).toEqual(['tag', 'text', 'damage', 'tag']);
    expect((e.parts[0] as CardEffectPartTag).tag).toBe('ability');
    expect((e.parts[3] as CardEffectPartTag).tag).toBe('weapon');

    expect(cardEffectToString(e)).toBe(s);
  });

  it('stringToCardEffect() trims and normalizes whitespace', () => {
    const s = '  PVP?   AURA (3)   2D   FLIP  ';
    const e = stringToCardEffect(s);
    expect(cardEffectToString(e)).toBe('PVP? AURA (3) 2D FLIP');
  });

  it('stringToCardEffect() returns empty effect for empty input', () => {
    const e = stringToCardEffect('   ');
    expect(e.conditionals).toEqual([]);
    expect(e.aura).toBeUndefined();
    expect(e.parts).toEqual([]);
    expect(cardEffectToString(e)).toBe('');
  });
});

import { Aspect } from './Aspect';
import {
  CardEffect,
  CardEffectPart,
  CardEffectPartText,
  CardEffectPartDamage,
  CardEffectPartQuell,
  CardEffectPartCard,
  CardEffectPartTag,
  CardEffectPartAspect,
} from './CardEffect';
import { Conditional } from './Conditional';
import { Tag } from './Tag';

export function cardEffectToString(effect: CardEffect, options?: {
  permitEndingSpace?: boolean;
}): string {
  const conditionalsString = effect.conditionals.map(conditionalToString).join(' ');
  const partsString = effect.parts.map(part => cardPartToString(part)).join(' ');
  const auraString = auraToString(effect.aura);
  let result = `${conditionalsString} ${auraString} ${partsString}`.trimStart();
  if (!options?.permitEndingSpace) {
    result = result.trimEnd();
  }
  return result;
}

export function auraToString(
  aura: number | { from: number; to: number } | undefined,
): string {
  if (!aura) return '';
  if (typeof aura === 'number') {
    return `AURA (${aura})`;
  }
  return `AURA (${aura.from}-${aura.to})`;
}

export function conditionalToString(conditional: Conditional): string {
  switch (conditional) {
    case Conditional.Pvp:
      return 'PVP?';
    case Conditional.Solo:
      return 'SOLO?';
    case Conditional.Infinite:
      return 'INF?';
    case Conditional.TurnEnd:
      return 'TURNEND?';
    case Conditional.DrawEnd:
      return 'DRAWEND?';
    case Conditional.React:
      return 'REACT';
    default:
      return '???';
  }
}

export function cardPartToString(part: CardEffectPart): string {
  switch (part.type) {
    case 'text':
      return (part as CardEffectPartText).text;
    case 'damage':
      return `${(part as CardEffectPartDamage).amount}D`;
    case 'quell':
      return `${(part as CardEffectPartQuell).amount}Q`;
    case 'card': {
      const cardPart = part as CardEffectPartCard;
      return `${cardPart.amount ? cardPart.amount : ''}${cardPart.orMore ? '+' : ''}C`;
    }
    case 'tag':
      return `${(part as CardEffectPartTag).tag.toUpperCase()}`;
    case 'aspect': {
      const aspect = (part as CardEffectPartAspect).aspect;
      switch (aspect) {
        case Aspect.Brave:
          return '(R)';
        case Aspect.Cunning:
          return '(G)';
        case Aspect.Wise:
          return '(B)';
        case Aspect.Charming:
          return '(Y)';
        default:
          return '';
      }
    }
    case 'flip':
      return 'FLIP';
    case 'scrapped':
      return 'SCRAPPED';
    default:
      return '???';
  }
}

/**
 * Parses the DSL produced by cardEffectToString().
 *
 * Grammar (whitespace-separated tokens):
 * - Conditionals (prefix, repeatable):
 *    PVP? | SOLO? | INF? | REACT | TURNEND? | DRAWEND?
 * - Optional aura:
 *    AURA (N) | AURA (FROM-TO)
 * - Parts (rest of tokens):
 *    <text> | <n>D | <n>Q | <n>C | <n>+C | C | +C | FLIP | SCRAPPED | (R)|(G)|(B)|(Y) | <TAG>
 *
 * Notes:
 * - "text" parts are any tokens not matching other patterns.
 * - "tag" parts are any ALL-CAPS token not recognized as a keyword/part; stored as lowercase.
 */
export function stringToCardEffect(text: string, options?: {
  permitEndingSpace?: boolean;
}): CardEffect {
  text = text.trim();
  if (!text) {
    return { conditionals: [], aura: undefined, parts: [] } as CardEffect;
  }

  const tokens = text.split(/\s+/);
  let i = 0;

  const conditionals: Conditional[] = [];

  const tryConsumeConditional = (): boolean => {
    const t = tokens[i];

    if (!t) return false;

    if (t === 'PVP?') {
      conditionals.push(Conditional.Pvp);
      i += 1;
      return true;
    }
    if (t === 'SOLO?') {
      conditionals.push(Conditional.Solo);
      i += 1;
      return true;
    }
    if (t === 'INF?') {
      conditionals.push(Conditional.Infinite);
      i += 1;
      return true;
    }
    if (t === 'REACT') {
      conditionals.push(Conditional.React);
      i += 1;
      return true;
    }
    if (t === 'TURNEND?') {
      conditionals.push(Conditional.TurnEnd);
      i += 1;
      return true;
    }
    if (t === 'DRAWEND?') {
      conditionals.push(Conditional.DrawEnd);
      i += 1;
      return true;
    }

    return false;
  };

  while (tryConsumeConditional()) {
    // keep consuming
  }

  // Optional aura
  let aura: number | { from: number; to: number } | undefined;

  if (tokens[i] === 'AURA') {
    const next = tokens[i + 1] ?? '';
    const m = next.match(/^\((\d+)(?:-(\d+))?\)$/);
    if (m) {
      const from = Number(m[1]);
      const to = m[2] ? Number(m[2]) : undefined;
      aura = typeof to === 'number' ? { from, to } : from;
      i += 2;
    } else {
      // "AURA" present but malformed; treat as text to avoid data loss
      // (and do not consume it as aura)
    }
  }

  const parts: CardEffectPart[] = [];

  const aspectFromToken = (t: string): Aspect | undefined => {
    switch (t) {
      case '(R)':
        return Aspect.Brave;
      case '(G)':
        return Aspect.Cunning;
      case '(B)':
        return Aspect.Wise;
      case '(Y)':
        return Aspect.Charming;
      default:
        return undefined;
    }
  };

  for (; i < tokens.length; i++) {
    const t = tokens[i];

    if (t === 'FLIP') {
      parts.push({ type: 'flip' } as CardEffectPart);
      continue;
    }

    if (t === 'SCRAPPED') {
      parts.push({ type: 'scrapped' } as CardEffectPart);
      continue;
    }

    const asp = aspectFromToken(t);
    if (asp) {
      parts.push({ type: 'aspect', aspect: asp } as CardEffectPartAspect);
      continue;
    }

    const dm = t.match(/^(\d+)D$/);
    if (dm) {
      parts.push({ type: 'damage', amount: Number(dm[1]) } as CardEffectPartDamage);
      continue;
    }

    const qm = t.match(/^(\d+)Q$/);
    if (qm) {
      parts.push({ type: 'quell', amount: Number(qm[1]) } as CardEffectPartQuell);
      continue;
    }

    // Card part: "C", "+C", "2C", "2+C"
    const cm = t.match(/^(\d+)?(\+)?C$/);
    if (cm) {
      const amount = cm[1] ? Number(cm[1]) : undefined;
      const orMore = !!cm[2];
      parts.push({ type: 'card', amount, orMore } as CardEffectPartCard);
      continue;
    }

    // Tag part heuristic: all-caps word (A-Z/0-9/_/-), not a known keyword.
    // Store lowercased because cardPartToString uppercases it.
    const isAllCaps =
      /^[A-Z0-9][A-Z0-9_-]*$/.test(t) &&
      t !== 'AURA' &&
      t !== 'PVP?' &&
      t !== 'SOLO?' &&
      t !== 'INF?' &&
      t !== 'REACT' &&
      t !== 'FLIP' &&
      t !== 'SCRAPPED' &&
      t !== 'TURNEND?' &&
      t !== 'DRAWEND?';

    if (isAllCaps && Object.values(Tag).includes(t.toLowerCase() as Tag)) {
      parts.push({ type: 'tag', tag: t.toLowerCase() } as CardEffectPartTag);
      continue;
    }

    // Default: treat as plain text token
    // Add back in ending space, to account for typing
    parts.push({
      type: 'text',
      text: text.endsWith(' ') && options?.permitEndingSpace ? t + ' ' : t,
    } as CardEffectPartText);
  }

  return { conditionals, aura, parts } as CardEffect;
}

import { Aspect } from './Aspect';
import { Conditional } from './Conditional';
import { Tag } from './Tag';

export type CardEffect = {
  conditionals: Conditional[];
  aura?: number | {
    // @NOTE: These are only used for Apex.type === 'hidden'
    from: number;
    to: number;
  };
  parts: CardEffectPart[];
}

export type CardEffectPartText = CardEffectPart & {
  type: 'text';
  text: string;
}

export type CardEffectPartDamage = CardEffectPart & {
  type: 'damage';
  amount: number;
}

export type CardEffectPartQuell = CardEffectPart & {
  type: 'quell';
  amount: number;
}

export type CardEffectPartCard = CardEffectPart & {
  type: 'card';
  amount?: number;
  orMore?: true;
}

export type CardEffectPartTag = CardEffectPart & {
  type: 'tag';
  tag: Tag;
}

export type CardEffectPartAspect = CardEffectPart & {
  type: 'aspect';
  aspect: Aspect;
}

export type CardEffectPart = {
  type: 'text' | 'damage' | 'quell' | 'card' | 'tag' | 'flip' | 'scrapped' | 'aspect';
}

export function cardEffectToString(effect: CardEffect): string {
  const conditionalsString = effect.conditionals.map(conditionalToString).join(' ');
  const partsString = effect.parts.map(part => cardPartToString(part)).join(' ');
  const auraString = auraToString(effect.aura);
  return `${conditionalsString} ${auraString} ${partsString}`.trim();
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
      return '∞';
    case Conditional.TurnEnd:
      return 'TURN END?';
    case Conditional.DrawEnd:
      return 'DRAW END?';
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
    case 'card':
      const cardPart = part as CardEffectPartCard;
      return `${cardPart.amount ? cardPart.amount : ''}${cardPart.orMore ? '+' : ''}C`;
    case 'tag':
      return `${(part as CardEffectPartTag).tag.toUpperCase()}`;
    case 'aspect':
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
    case 'flip':
      return 'FLIP';
    case 'scrapped':
      return 'SCRAPPED';
    default:
      return '???';
  }
}

export function defaultHideCardEffect(effect: CardEffect): CardEffect {
  const auraRange = typeof effect.aura === 'number' ? defaultAuraRange(effect.aura) : effect.aura;
  return {
    conditionals: [...effect.conditionals],
    aura: auraRange,
    parts: [],
  };
}

export function defaultAuraRange(aura: number | undefined): { from: number; to: number } | undefined {
  if (!aura) return undefined;
  if (aura <= 2) return { from: 1, to: 2 };
  if (aura <= 5) return { from: 3, to: 5 };
  // @NOTE: 5 is not possible, but included for readability
  if (aura <= 10) return { from: 5, to: 10 };
  // @NOTE: 10 is not possible, but included for readability
  if (aura <= 20) return { from: 10, to: 20 };
  return { from: 20, to: 100 };
}

export function defineCardEffect(effect: CardEffect): CardEffect {
  const auraValue = defineAura(effect.aura);
  return {
    conditionals: [...effect.conditionals],
    aura: auraValue,
    parts: { ...effect.parts },
  };
}

export function defineAura(
  aura: number | { from: number; to: number } | undefined,
): number | undefined {
  if (typeof aura === 'number' || !aura) {
    return aura;
  }
  // pick a random number within the range
  return Math.floor(Math.random() * (aura.to - aura.from + 1)) + aura.from;
}

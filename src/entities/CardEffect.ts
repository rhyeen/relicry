import { Aspect } from './Aspect';
import { Conditional } from './Conditional';
import { LocaleMap } from './LocaleMap';
import { Tag } from './Tag';

export interface CardEffect {
  conditionals: Conditional[];
  aura?: number | {
    // @NOTE: These are only used for Apex.type === 'hidden'
    from: number;
    to: number;
  };
  parts: LocaleMap<CardEffectPart[]>;
}

export interface CardEffectPartText extends CardEffectPart {
  type: 'text';
  text: string;
}

export interface CardEffectPartDamage extends CardEffectPart {
  type: 'damage';
  amount: number;
}

export interface CardEffectPartQuell extends CardEffectPart {
  type: 'quell';
  amount: number;
}

export interface CardEffectPartCard extends CardEffectPart {
  type: 'card';
  amount?: number;
  orMore?: true;
}

export interface CardEffectPartTag extends CardEffectPart {
  type: 'tag';
  tag: Tag;
}

export interface CardEffectPartAspect extends CardEffectPart {
  type: 'aspect';
  aspect: Aspect;
}

export interface CardEffectPart {
  type: 'text' | 'damage' | 'quell' | 'card' | 'tag' | 'flip' | 'scrapped' | 'aspect';
}

export function defaultHideCardEffect(effect: CardEffect): CardEffect {
  const auraRange = typeof effect.aura === 'number' ? defaultAuraRange(effect.aura) : effect.aura;
  return {
    conditionals: [...effect.conditionals],
    aura: auraRange,
    parts: { en: [] },
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

import { Aspect } from './Aspect';
import { Conditional } from './Conditional';
import { LocaleMap } from './LocaleMap';
import { Tag } from './Tag';

export interface CardEffect {
  conditionals: Conditional[];
  aura?: number | {
    // @NOTE: These are only used for HiddenApex
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

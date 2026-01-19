import { Aspect } from './Aspect';
import { CardEffect, CardEffectPart, CardEffectPartText, CardEffectPartDamage, CardEffectPartQuell, CardEffectPartCard, CardEffectPartTag, CardEffectPartAspect } from './CardEffect';
import { Conditional } from './Conditional';

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
      return 'INF?';
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

export function stringToCardEffect(text: string): CardEffect {
  
}
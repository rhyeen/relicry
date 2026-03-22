import { VersionedCard } from './Card';
import { Rarity } from './Rarity';

type CardTitleInput = Pick<VersionedCard, 'title'>;
type CardSubtitleInput = Pick<VersionedCard, 'type' | 'rarity' | 'subTitle'>;

export function requiresCardSubtitle(card: CardSubtitleInput): boolean {
  return [Rarity.Epic, Rarity.Legendary].includes(card.rarity);
}

export function canHaveCardSubtitle(card: CardSubtitleInput): boolean {
  return card.type === 'gambit' || requiresCardSubtitle(card);
}

export function shouldPersistCardSubtitle(card: CardSubtitleInput): boolean {
  return canHaveCardSubtitle(card) && !!card.subTitle?.trim();
}

export function getCardTitleError(card: CardTitleInput): string | undefined {
  if (!card.title.trim()) {
    return 'Title is required.';
  }
  return undefined;
}

export function getCardSubtitleError(card: CardSubtitleInput): string | undefined {
  if (!requiresCardSubtitle(card)) {
    return undefined;
  }
  if (!card.subTitle?.trim()) {
    return 'Subtitle is required for Epic and Legendary cards.';
  }
  return undefined;
}

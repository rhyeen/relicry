import type { KeyboardEvent } from 'react';

export type CardExplanationPart =
  | 'all'
  | 'illustration'
  | 'artist'
  | 'metadata'
  | 'title'
  | 'type'
  | 'rarity'
  | 'aspect'
  | 'tags'
  | 'effects'
  | 'flavorText'
  | 'drawLimit'
  | 'scrapCost'
  | 'qrCode';

export type CardPartSelectionProps = {
  selectedPart?: CardExplanationPart;
  onPartSelect?: (part: CardExplanationPart) => void;
};

export function getCardPartInteractionProps({
  disabled,
  label,
  onPartSelect,
  part,
  selectedPart,
}: {
  disabled?: boolean;
  label: string;
  onPartSelect?: (part: CardExplanationPart) => void;
  part: CardExplanationPart;
  selectedPart?: CardExplanationPart;
}) {
  if (disabled || !onPartSelect) {
    return {};
  }

  const selectPart = () => onPartSelect(part);

  return {
    'aria-label': label,
    'data-selected': selectedPart === part ? 'true' : undefined,
    onClick: selectPart,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectPart();
      }
    },
    role: 'button',
    tabIndex: 0,
  };
}

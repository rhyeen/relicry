import { VersionedCard, VersionedFocusCard } from '@/entities/Card';
import styles from '../Card.module.css';
import FlavorTextCardPart from './FlavorTextCardPart';
import EffectsCardPart from './EffectsCardPart';
import { CardContext } from '@/entities/CardContext';
import type { CardPartSelectionProps } from '../cardExplanationParts';

type Props = CardPartSelectionProps & {
  card: VersionedCard;
  ctx: CardContext;
  focusAwakened?: boolean;
}

export default function DetailsCardPart({
  card,
  ctx,
  focusAwakened,
  selectedPart,
  onPartSelect,
}: Props) {
  const thisSide = focusAwakened && card.awakened ? (card as VersionedFocusCard).awakened : card;
  const thisVersion = focusAwakened && card.awakened ? (card as VersionedFocusCard).awakenedVersion : card;
  return (
    <div className={styles.details}>
      <FlavorTextCardPart
        flavorText={thisVersion.flavorText}
        ctx={ctx}
        selectedPart={selectedPart}
        onPartSelect={onPartSelect}
      />
      <EffectsCardPart effects={thisSide.effects} ctx={ctx} selectedPart={selectedPart} onPartSelect={onPartSelect} />
    </div>
  );
}

import { CardContext } from '@/entities/CardContext';
import styles from '../Card.module.css';
import { getCardPartInteractionProps, type CardPartSelectionProps } from '../cardExplanationParts';

type Props = CardPartSelectionProps & {
  drawLimit: number;
  ctx: CardContext;
}

export default function DrawLimitCardPart({ drawLimit, ctx, selectedPart, onPartSelect }: Props) { 
  return (
    <div
      aria-label='Draw Limit'
      className={styles.drawLimit}
      {...getCardPartInteractionProps({
        disabled: ctx.hideCardPartInteractions,
        label: `Explain draw limit ${drawLimit === -1 ? 'special' : drawLimit}`,
        onPartSelect,
        part: 'drawLimit',
        selectedPart,
      })}
    >
      <span
        className={`${drawLimit === 5 ? styles.drawLimit5 : ''} ${drawLimit === 7 ? styles.drawLimit7 : ''} ${drawLimit === -1 ? styles.drawLimitStar : ''}`}
      >{drawLimit === -1 ? '*' : drawLimit}</span>
    </div>
  );
}

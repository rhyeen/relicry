import { CardContext } from '@/entities/CardContext';
import styles from '../Card.module.css';
import { getCardPartInteractionProps, type CardPartSelectionProps } from '../cardExplanationParts';

type Props = CardPartSelectionProps & {
  type: 'gambit' | 'focus';
  ctx: CardContext;
}

const localeEn = {
  'gambit': 'Gambit',
  'focus': 'Focus',
};

export default function TypeTitleCardPart({ type, ctx, selectedPart, onPartSelect }: Props) { 
  const title = localeEn[type];
  return (
    <div
      className={`${styles.typeTitle} ${styles[type]}`}
      data-type={type}
      aria-label={title}
      {...getCardPartInteractionProps({
        disabled: ctx.hideCardPartInteractions,
        label: `Explain ${title} card type`,
        onPartSelect,
        part: 'type',
        selectedPart,
      })}
    >
      {title}
    </div>
  );
}

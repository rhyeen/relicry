import { CardContext } from '@/entities/CardContext';
import CardEffectLine from '../card-effects/CardEffectLine';
import styles from '../Card.module.css';
import { CardEffect } from '@/entities/CardEffect';
import { getCardPartInteractionProps, type CardPartSelectionProps } from '../cardExplanationParts';

type Props = CardPartSelectionProps & {
  effects: CardEffect[];
  ctx: CardContext;
}

export default function EffectsCardPart({ effects, ctx, selectedPart, onPartSelect }: Props) {
  return (
    <div
      className={styles.effectsContainer}
      {...getCardPartInteractionProps({
        disabled: ctx.hideCardPartInteractions,
        label: 'Explain card effects',
        onPartSelect,
        part: 'effects',
        selectedPart,
      })}
    >
      {effects.map((effect, index) => (
        <div key={index} className={styles.effect}>
          <CardEffectLine
            effect={effect}
            variableSize={true}
            single={effects.length === 1}
            ctx={ctx}
          />
        </div>
      ))}
    </div>
  );
}

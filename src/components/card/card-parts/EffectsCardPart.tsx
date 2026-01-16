import { CardContext } from '@/entities/CardContext';
import CardEffectLine from '../card-effects/CardEffectLine';
import styles from '../Card.module.css';
import { CardEffect } from '@/entities/CardEffect';

type Props = {
  effects: CardEffect[];
  ctx: CardContext;
}

export default function EffectsCardPart({ effects, ctx }: Props) {
  return (
    <div className={styles.effectsContainer}>
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

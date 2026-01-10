import CardEffectLine from '../card-effects/CardEffectLine';
import styles from '../Card.module.css';
import { CardEffect } from '@/entities/CardEffect';

type Props = {
  effects: CardEffect[];
}

export default function EffectsCardPart({ effects }: Props) {
  return (
    <div className={styles.effectsContainer}>
      {effects.map((effect, index) => (
        <div key={index} className={styles.effect}>
          <CardEffectLine effect={effect} variableSize={true} single={effects.length === 1} />
        </div>
      ))}
    </div>
  );
}

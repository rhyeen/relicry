import CardAura from './CardAura';
import CardConditional from './CardConditional';
import styles from './CardEffectLine.module.css';
import { CardEffect, cardEffectToString } from '@/entities/CardEffect';
import CardEffectParts from './CardEffectParts';

type Props = {
  effect: CardEffect;
  single?: boolean;
  variableSize?: boolean;
}

export default function CardEffectLine({
  effect, single = false, variableSize = false
}: Props) {
  return (
    <div
      className={`${styles.effectLine} ${single ? styles.single : ''} ${variableSize ? styles.variableSize : ''}`}
      aria-label={`Effect: ${cardEffectToString(effect)}`}
    >
      <div className={styles.effectConditionals}>
        {effect.conditionals.map((conditional, index) => (
          <CardConditional
            key={index}
            conditional={conditional}
            straightLeft={index === 0}
          />
        ))}
        {effect.aura !== undefined && (
          <CardAura aura={effect.aura} />
        )}
        <CardEffectParts parts={effect.parts} />
      </div>
    </div>
  );
}
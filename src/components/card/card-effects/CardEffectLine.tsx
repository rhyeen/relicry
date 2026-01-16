import CardAura from './CardAura';
import CardConditional from './CardConditional';
import styles from './CardEffectLine.module.css';
import { CardEffect, cardEffectToString } from '@/entities/CardEffect';
import CardEffectParts from './CardEffectParts';
import { CardContext } from '@/entities/CardContext';

type Props = {
  effect: CardEffect;
  single?: boolean;
  variableSize?: boolean;
  ctx: CardContext;
}

export default function CardEffectLine({
  effect, single = false, variableSize = false, ctx
}: Props) {
  const largeAndCenter = (
    variableSize && single && !effect.aura && !effect.conditionals.length &&
    cardEffectToString(effect).length < 15
  );

  return (
    <div
      className={`${styles.effectLine} ${largeAndCenter ? styles.largeAndCenter : ''}`}
      aria-label={`Effect: ${cardEffectToString(effect)}`}
    >
      <div className={styles.effectConditionals}>
        {effect.conditionals.map((conditional, index) => (
          <CardConditional
            key={index}
            conditional={conditional}
            straightLeft={index === 0}
            ctx={ctx}
          />
        ))}
        {effect.aura !== undefined && (
          <CardAura aura={effect.aura} ctx={ctx} />
        )}
        <CardEffectParts parts={effect.parts} ctx={ctx} />
      </div>
    </div>
  );
}
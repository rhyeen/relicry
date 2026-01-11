import { CardEffectPart, CardEffectPartAspect, CardEffectPartCard, CardEffectPartDamage, CardEffectPartQuell, CardEffectPartTag, CardEffectPartText } from '@/entities/CardEffect';
import styles from './CardEffectParts.module.css';
import CardTag from './CardTag';

type Props = {
  parts: CardEffectPart[];
}

export default function CardEffectParts({
  parts,
}: Props) {
  const getPart = (part: CardEffectPart) => {
    switch (part.type) {
      case 'text':
        return (part as CardEffectPartText).text;
      case 'card':
        return (
          <span className={styles.cardPart}>
            <span className={styles.cardPartSymbol} style={{
              backgroundImage: 'url(/assets/card/part/card.1.png)',
            }} />
            <span className={styles.numberPart}>{ (part as CardEffectPartCard).amount }</span>
          </span>
        );
      case 'damage':
        return (
          <span className={styles.damagePart}>
            <span className={styles.damagePartSymbol} style={{
              backgroundImage: 'url(/assets/card/part/damage.1.png)',
            }} />
            <span className={styles.numberPart}>{ (part as CardEffectPartDamage).amount }</span>
          </span>
        );
      case 'flip':
        return (
          <span className={styles.flipPart}>
            <span className={styles.flipPartSymbol} style={{
              backgroundImage: 'url(/assets/card/part/flip.1.png)',
            }} />
          </span>
        );
      case 'scrapped':
        return (
          <span className={styles.scrappedPart}>
            <span className={styles.scrappedPartSymbol} style={{
              backgroundImage: 'url(/assets/card/part/scrapped.1.png)',
            }} />
          </span>
        );
      case 'quell':
        return (
          <span className={styles.quellPart}>
            <span className={styles.quellPartSymbol} style={{
              backgroundImage: 'url(/assets/card/part/quell.1.png)',
            }} />
            <span className={styles.numberPart}>{ (part as CardEffectPartQuell).amount }</span>
          </span>
        )
      case 'tag':
        return (
          <span className={styles.tagPart}>
            <CardTag tag={(part as CardEffectPartTag).tag} />
          </span>
        );
      case 'aspect':
        const aspect = (part as CardEffectPartAspect).aspect;
        return (
          <span className={styles.aspectPart}>
            <span className={styles.aspectPartSymbol} style={{
              backgroundImage: `url(/assets/card/part/tooltip-${aspect}.1.png)`,
            }} />
          </span>
        );
      default:
        return '???';
    }
  };

  return (
    <div className={styles.partsContainer}>
      {parts.map((part, index) => (
        <span
          key={index}
          className={styles.part}
        >
          {getPart(part)}
        </span>
      ))}
    </div>
  );
}
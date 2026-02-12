import { CardEffectPart, CardEffectPartAspect, CardEffectPartCard, CardEffectPartDamage, CardEffectPartQuell, CardEffectPartTag, CardEffectPartText } from '@/entities/CardEffect';
import styles from './CardEffectParts.module.css';
import CardTag from './CardTag';
import { assetURL, CardContext } from '@/entities/CardContext';

type Props = {
  parts: CardEffectPart[];
  ctx: CardContext;
}

export default function CardEffectParts({
  parts, ctx,
}: Props) {
  const getNumberPart = (amount: number | undefined) => {
    const classNames = [styles.numberPart];
    if (amount === 1) {
      classNames.push(styles.one);
    }
    return <span className={classNames.join(' ')}>{amount}</span>;
  };

  const getPart = (part: CardEffectPart) => {
    switch (part.type) {
      case 'text':
        return (part as CardEffectPartText).text;
      case 'card':
        return (
          <span className={styles.cardPart}>
            <span className={styles.cardPartSymbol} style={{
              backgroundImage: `url(${assetURL(ctx, 'part/card.1.png')})`,
            }} />
            {getNumberPart((part as CardEffectPartCard).amount)}
          </span>
        );
      case 'damage':
        return (
          <span className={styles.damagePart}>
            <span className={styles.damagePartSymbol} style={{
              backgroundImage: `url(${assetURL(ctx, 'part/damage.1.png')})`,
            }} />
            {getNumberPart((part as CardEffectPartDamage).amount)}
          </span>
        );
      case 'flip':
        return (
          <span className={styles.flipPart}>
            <span className={styles.flipPartSymbol} style={{
              backgroundImage: `url(${assetURL(ctx, 'part/flip.1.png')})`,
            }} />
          </span>
        );
      case 'scrapped':
        return (
          <span className={styles.scrappedPart}>
            <span className={styles.scrappedPartSymbol} style={{
              backgroundImage: `url(${assetURL(ctx, 'part/scrapped.1.png')})`,
            }} />
          </span>
        );
      case 'quell':
        return (
          <span className={styles.quellPart}>
            <span className={styles.quellPartSymbol} style={{
              backgroundImage: `url(${assetURL(ctx, 'part/quell.1.png')})`,
            }} />
            {getNumberPart((part as CardEffectPartQuell).amount)}
          </span>
        )
      case 'tag':
        return (
          <span className={styles.tagPart}>
            <CardTag tag={(part as CardEffectPartTag).tag} ctx={ctx} />
          </span>
        );
      case 'aspect':
        const aspect = (part as CardEffectPartAspect).aspect;
        return (
          <span className={styles.aspectPart}>
            <span className={styles.aspectPartSymbol} style={{
              backgroundImage: `url(${assetURL(ctx, `part/tooltip-${aspect}.1.png`)})`,
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
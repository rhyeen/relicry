import { CardEffectPart, CardEffectPartAspect, CardEffectPartCard, CardEffectPartDamage, CardEffectPartDrawLimit, CardEffectPartGlimpse, CardEffectPartQuell, CardEffectPartTag, CardEffectPartText } from '@/entities/CardEffect';
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
        const text = (part as CardEffectPartText).text;
        // If text starts with punctuation, render it in a span to avoid weird spacing issues
        if (text.length > 0 && /[.,\/#!$%\^&\*;:{}=\-_`~()]/.test(text[0])) {
          return (
            <span className={styles.punctuationPart}>
              {text}
            </span>
          );
        } else {
          return (part as CardEffectPartText).text;
        }
      case 'card':
        if ((part as CardEffectPartCard).orMore) {
          return (
            <span className={styles.cardPart}>
              <span className={styles.cardPartSymbol} style={{
                backgroundImage: `url(${assetURL(ctx, 'part/card.1.png')})`,
              }} />
              {getNumberPart((part as CardEffectPartCard).amount)}
            </span>
          );
        } else {
            return (
            <span className={styles.cardPartPlus}>
              <span className={styles.cardPartPlusSymbol} style={{
                backgroundImage: `url(${assetURL(ctx, 'part/card-plus.1.png')})`,
              }} />
              {getNumberPart((part as CardEffectPartCard).amount)}
            </span>
          );
        }
      case 'downCard':
        return (
          <span className={styles.cardPart}>
            <span className={styles.cardPartSymbol} style={{
              backgroundImage: `url(${assetURL(ctx, `part/card-down.1.png`)})`,
            }} />
          </span>
        );
      case 'glimpse':
        const amount = (part as CardEffectPartGlimpse).amount;
        return (
          <span className={styles.glimpsePart}>
            <span className={`${styles.glimpsePartSymbol} ${amount === 2 || amount === 4 ? styles.bump : ''}`} style={{
              backgroundImage: `url(${assetURL(ctx, `part/glimpse-${(part as CardEffectPartGlimpse).lookAt}.1.png`)})`,
            }} />
            {getNumberPart(amount)}
          </span>
        );
      case 'drawLimit':
        return (
          <span className={styles.drawLimitPart}>
            <span className={styles.drawLimitPartSymbol} style={{
              backgroundImage: `url(${assetURL(ctx, 'part/draw-limit.1.png')})`,
            }} />
            {getNumberPart((part as CardEffectPartDrawLimit).amount)}
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

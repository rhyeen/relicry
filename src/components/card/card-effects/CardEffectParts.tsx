import { CardEffectPart, CardEffectPartCard, CardEffectPartText } from '@/entities/CardEffect';
import styles from './CardEffectParts.module.css';

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
              backgroundImage: 'url(/assets/card/part/part-card.1.png)',
            }} />
            <span className={styles.numberPart}>{ (part as CardEffectPartCard).amount }</span>
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
import { getCardDocId } from '@/entities/Card';
import styles from '../Card.module.css';
import { FlavorText } from '@/entities/FlavorText';

type Props = {
  flavorText?: FlavorText;
}

export default function HeaderCardPart({ flavorText }: Props) {
  if (!flavorText || !flavorText.onCard) return null;

  let text = flavorText.onCard.text;
  // Replace quotes with curly quotes
  if (text.startsWith('"')) {
    text = '“' + text.slice(1);
  }
  if (text.endsWith('"')) {
    text = text.slice(0, -1) + '”';
  }
  if (!text.startsWith("“") && flavorText.onCard.source) {
    text = `“${text}”`;
  }
  if (flavorText.onCard.source) {
    text += ` ~ ${flavorText.onCard.source}`;
  }

  return (
    <div className={styles.flavorTextContainer}>
      <div aria-label='Flavor Text' className={styles.flavorText}>{text}</div>
    </div>
  );
}

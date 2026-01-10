import styles from '../Card.module.css';
import { FlavorText } from '@/entities/FlavorText';

type Props = {
  flavorText?: FlavorText;
}

export default function FlavorTextCardPart({ flavorText }: Props) {
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

  const getFlavorLineImageUrl = () => {
    if (flavorText.extended) {
      return '/assets/card/flavor-extended.2.png';
    } else {
      return '/assets/card/flavor-normal.2.png';
    }
  }

  return (
    <div className={styles.flavorTextContainer}>
      <div aria-label='Flavor Text' className={styles.flavorText}>{text}</div>
      <div
        className={styles.flavorTextLine}
        data-flavor-extended={!!flavorText.extended}
        style={{
          backgroundImage: `url(${getFlavorLineImageUrl()})`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

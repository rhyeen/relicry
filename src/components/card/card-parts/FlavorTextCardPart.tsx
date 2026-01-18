import { assetURL, CardContext } from '@/entities/CardContext';
import styles from '../Card.module.css';
import { FlavorText } from '@/entities/FlavorText';

type Props = {
  flavorText?: FlavorText;
  ctx: CardContext;
}

export default function FlavorTextCardPart({ flavorText, ctx }: Props) {
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
      return assetURL(ctx, 'flavor-extended.2.png');
    } else {
      return assetURL(ctx, 'flavor-normal.2.png');
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

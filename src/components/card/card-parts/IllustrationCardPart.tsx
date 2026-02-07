import { Art, IllustrationArt } from '@/entities/Art';
import styles from '../Card.module.css';
import { assetURL, CardContext } from '@/entities/CardContext';

type Props = {
  art: Art | null;
  ctx: CardContext;
}

const DEBUG = true;

export default function IllustrationCardPart({ art, ctx }: Props) {
  let backgroundImage = assetURL(ctx, 'example-illustration.ai.webp');
  if (!DEBUG && (art && art.image && (art as IllustrationArt).image.card?.url)) {
    backgroundImage = (art as IllustrationArt).image.card?.url || '';
  }

  return (
    <div
      className={styles.illustration}
      aria-hidden="true"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className={styles.illustrationClickable} />
    </div>
  );
}

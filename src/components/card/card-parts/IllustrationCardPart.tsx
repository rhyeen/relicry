import { Art, IllustrationArt } from '@/entities/Art';
import styles from '../Card.module.css';
import { assetURL, CardContext } from '@/entities/CardContext';

type Props = {
  art: Art | null;
  ctx: CardContext;
  awakenedArt?: Art | null;
  focusAwakened?: boolean;
  isSample?: boolean;
}

const DEBUG_ALWAYS_SHOW_EXAMPLE = false;

export default function IllustrationCardPart({ art, awakenedArt, ctx, focusAwakened, isSample }: Props) {
  const _art = focusAwakened ? awakenedArt : art;
  let backgroundImage = assetURL(ctx, 'example-illustration.ai.webp');
  if (!DEBUG_ALWAYS_SHOW_EXAMPLE && (_art && _art.image && (_art as IllustrationArt).image.card?.url)) {
    backgroundImage = (_art as IllustrationArt).image.card?.url || '';
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
      {isSample && <div className={styles.sampleWatermark} aria-hidden>Sample</div>}
      {isSample && <div className={styles.sampleTag} aria-label='This is a Sample Card'>Sample</div>}
    </div>
  );
}

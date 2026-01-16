import { Art } from '@/entities/Art';
import styles from '../Card.module.css';
import { assetURL, CardContext } from '@/entities/CardContext';

type Props = {
  art: Art | null;
  ctx: CardContext;
}

export default function IllustrationCardPart({ art, ctx }: Props) {
  return (
    <div
      className={styles.illustration}
      aria-hidden="true"
      style={{
        backgroundImage: `url(${assetURL(ctx, 'example-illustration.ai.webp')})`,
      }}
    >
      <div className={styles.illustrationClickable} />
    </div>
  );
}

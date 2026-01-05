import { Art } from '@/entities/Art';
import styles from './Card.module.css';

type Props = {
  art: Art | null;
}

export default function IllustrationCardPart({ art }: Props) {
  return (
    <div
      className={styles.illustration}
      aria-hidden="true"
      style={{
        backgroundImage: `url(/assets/card/example-illustration.ai.webp)`,
      }}
    />
  );
}

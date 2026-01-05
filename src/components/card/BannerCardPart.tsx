import styles from './Card.module.css';
import { Aspect } from '@/entities/Aspect';

type Props = {
  aspect: Aspect | [Aspect, Aspect];
}

export default function BannerCardPart({ aspect }: Props) {
  const getColorStyle = () => {
    switch (aspect) {
      case Aspect.Brave:
        return styles.red;
      case Aspect.Cunning:
        return styles.green;
      case Aspect.Wise:
        return styles.blue;
      case Aspect.Charming:
        return styles.yellow;
      default:
        throw new Error(`Unknown card aspect: ${aspect}`);
    }
  };

  return (
    <div aria-hidden="true" className={styles.bannerContainer}>
      <div
        className={`${styles.banner} ${styles.bottom} ${getColorStyle()}`}
        aria-hidden="true"
      />
      <div
        className={`${styles.banner} ${styles.top} ${getColorStyle()}`}
        aria-hidden="true"
        data-aspect={aspect}
      />
    </div>
  );
}

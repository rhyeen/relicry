import styles from '../Card.module.css';
import { Aspect } from '@/entities/Aspect';

type Props = {
  aspect: Aspect | [Aspect, Aspect];
}

export default function BannerCardPart({ aspect }: Props) {
  const getColorStyle = () => {
    const sortedAspects = Array.isArray(aspect) ? [...aspect] : [aspect];
    switch (sortedAspects[0]) {
      case Aspect.Brave:
        if (sortedAspects.length === 2) {
          switch (sortedAspects[1]) {
            case Aspect.Cunning:
              return styles.redGreen;
            case Aspect.Wise:
              return styles.redBlue;
            case Aspect.Charming:
              return styles.yellowRed;
            default:
              throw new Error(`Unknown card aspect combination: ${aspect}`);
          }
        }
        return styles.red;
      case Aspect.Cunning:
        if (sortedAspects.length === 2) {
          switch (sortedAspects[1]) {
            case Aspect.Brave:
              return styles.redGreen;
            case Aspect.Wise:
              return styles.greenBlue;
            case Aspect.Charming:
              return styles.yellowGreen;
            default:
              throw new Error(`Unknown card aspect combination: ${aspect}`);
          }
        }
        return styles.green;
      case Aspect.Wise:
        if (sortedAspects.length === 2) {
          switch (sortedAspects[1]) {
            case Aspect.Brave:
              return styles.redBlue;
            case Aspect.Cunning:
              return styles.greenBlue;
            case Aspect.Charming:
              return styles.blueYellow;
            default:
              throw new Error(`Unknown card aspect combination: ${aspect}`);
          }
        }
        return styles.blue;
      case Aspect.Charming:
        if (sortedAspects.length === 2) {
          switch (sortedAspects[1]) {
            case Aspect.Brave:
              return styles.yellowRed;
            case Aspect.Cunning:
              return styles.yellowGreen;
            case Aspect.Wise:
              return styles.blueYellow;
            default:
              throw new Error(`Unknown card aspect combination: ${aspect}`);
          }
        }
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
      {!Array.isArray(aspect) &&
        <div
          className={`${styles.banner} ${styles.middle} ${getColorStyle()}`}
          aria-hidden="true"
          data-aspect={aspect}
        />
      }
      <div
        className={`${styles.banner} ${styles.top} ${getColorStyle()}`}
        aria-hidden="true"
        data-aspect={aspect}
      />
    </div>
  );
}

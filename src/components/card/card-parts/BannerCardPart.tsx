import styles from '../Card.module.css';
import { Aspect } from '@/entities/Aspect';
import { aspectAsArray } from './aspectsAsArray';
import { CardContext } from '@/entities/CardContext';

type Props = {
  aspect: Aspect | [Aspect, Aspect];
  ctx: CardContext;
}

export default function BannerCardPart({ aspect }: Props) {
  const getColorStyle = () => {
    const asArray = aspectAsArray(aspect);
    const aspectString = `${asArray[0]}/${asArray[1]}`;
    const sameAspect = asArray[0] === asArray[1];
    switch (asArray[0]) {
      case Aspect.Brave:
        if (!sameAspect) {
          switch (asArray[1]) {
            case Aspect.Cunning:
              return styles.redGreen;
            case Aspect.Wise:
              return styles.redBlue;
            case Aspect.Charming:
              return styles.yellowRed;
            default:
              throw new Error(`Unknown card aspect combination: ${aspectString}`);
          }
        }
        return styles.red;
      case Aspect.Cunning:
        if (!sameAspect) {
          switch (asArray[1]) {
            case Aspect.Brave:
              return styles.redGreen;
            case Aspect.Wise:
              return styles.greenBlue;
            case Aspect.Charming:
              return styles.yellowGreen;
            default:
              throw new Error(`Unknown card aspect combination: ${aspectString}`);
          }
        }
        return styles.green;
      case Aspect.Wise:
        if (!sameAspect) {
          switch (asArray[1]) {
            case Aspect.Brave:
              return styles.redBlue;
            case Aspect.Cunning:
              return styles.greenBlue;
            case Aspect.Charming:
              return styles.blueYellow;
            default:
              throw new Error(`Unknown card aspect combination: ${aspectString}`);
          }
        }
        return styles.blue;
      case Aspect.Charming:
        if (!sameAspect) {
          switch (asArray[1]) {
            case Aspect.Brave:
              return styles.yellowRed;
            case Aspect.Cunning:
              return styles.yellowGreen;
            case Aspect.Wise:
              return styles.blueYellow;
            default:
              throw new Error(`Unknown card aspect combination: ${aspectString}`);
          }
        }
        return styles.yellow;
      default:
        throw new Error(`Unknown card aspect: ${aspectString}`);
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

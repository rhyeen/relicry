import styles from '../Card.module.css';
import { Aspect } from '@/entities/Aspect';
import { aspectAsArray } from './aspectsAsArray';
import { assetURL, CardContext } from '@/entities/CardContext';

type Props = {
  aspect: Aspect | [Aspect, Aspect] | 'gambit';
  ctx: CardContext;
}

export default function AspectCardPart({ aspect, ctx }: Props) {
  let asArray: [Aspect, Aspect] | 'gambit';
  if (aspect === 'gambit') {
    asArray = 'gambit';
  } else {
    asArray = aspectAsArray(aspect);
  }

  const getAspectSymbolImageUrl = (aspect: Aspect | 'gambit') => {
    const startPath = assetURL(ctx, 'aspect/');
    const endPath = `.1.png`;
    switch (aspect) {
      case Aspect.Brave:
        return `${startPath}brave${endPath}`;
      case Aspect.Cunning:
        return `${startPath}cunning${endPath}`;
      case Aspect.Wise:
        return `${startPath}wise${endPath}`;
      case Aspect.Charming:
        return `${startPath}charming${endPath}`;
      case 'gambit':
        return `${startPath}gambit${endPath}`;
      default:
        throw new Error(`Unknown card aspect: ${aspect}`);
    }
  };

  const sameAspect = asArray === 'gambit' || asArray[0] === asArray[1];

  return (
    <div
      className={styles.aspectContainer}
      data-aspect={asArray === 'gambit' ? 'gambit' : (sameAspect ? asArray[0] : asArray[0] + "/" + asArray[1])}
    >
      {(sameAspect || asArray === 'gambit') ?
        <div
          className={styles.aspectSingle}
          style={{
            backgroundImage: `url(${getAspectSymbolImageUrl(asArray === 'gambit' ? 'gambit' : asArray[0])})`,
          }}
        />
      :
        <div className={styles.aspectDual}>
          <div
            className={styles.aspectDualLeft}
            style={{
              backgroundImage: `url(${getAspectSymbolImageUrl(asArray[0])})`,
            }}
          />
          <div
            className={styles.aspectDualRight}
            style={{
              backgroundImage: `url(${getAspectSymbolImageUrl(asArray[1])})`,
            }}
          />
          <div
            className={styles.aspectDualOverlay}
            style={{
              backgroundImage: `url(${assetURL(ctx, 'aspect/second-aspect.1.png')})`,
            }}
          />
        </div>
      }
    </div>
  );
}

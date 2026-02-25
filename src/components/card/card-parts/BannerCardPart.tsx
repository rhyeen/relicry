import styles from './BannerCardPart.module.css';
import { Aspect } from '@/entities/Aspect';
import { aspectAsArray } from './aspectsAsArray';
import { assetURL, CardContext } from '@/entities/CardContext';
import { Rarity } from '@/entities/Rarity';
import { ASSET_VERSION } from '../assetVersion';

type Props = {
  aspect: Aspect | [Aspect, Aspect];
  rarity: Rarity;
  focus?: boolean;
  focusAwakened?: boolean;
  ctx: CardContext;
}

export default function BannerCardPart({ aspect, rarity, focus, focusAwakened, ctx }: Props) {
  const getColorStyle = (top: boolean, hasFocus: boolean) => {
    const asArray = aspectAsArray(aspect);
    const aspectString = `${asArray[0]}/${asArray[1]}`;
    const sameAspect = asArray[0] === asArray[1];
    if (top) return styles.legendaryTop;
    if (focus && !focusAwakened) return styles.focusBlack;
    switch (asArray[0]) {
      case Aspect.Brave:
        if (hasFocus) return styles.focusRed;
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
        if (hasFocus) return styles.focusGreen;
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
        if (hasFocus) return styles.focusBlue;
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
        if (hasFocus) return styles.focusYellow;
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

  const getBanner = (top: boolean) => {
    if (top && rarity !== Rarity.Legendary) return null;
    return (
      <div
        aria-hidden="true"
        className={`${styles.bannerContainer} ${rarity === Rarity.Legendary ? styles.legendary : ''} ${top ? styles.top : styles.bottom}`}
        data-aspect={aspect}
      >
        <div
          className={`${styles.banner} ${styles.bottom} ${getColorStyle(top, !!focus)}`}
          aria-hidden="true"
        />
        {(!Array.isArray(aspect) && !top) &&
          <div
            className={`${styles.banner} ${styles.middle} ${getColorStyle(top, !!focus)}`}
            aria-hidden="true"
          />
        }
        <div
          className={`${styles.banner} ${styles.top} ${getColorStyle(top, !!focus)}`}
          aria-hidden="true"
        />
        {(top && rarity === Rarity.Legendary) &&
          <>
            <div
              className={`${styles.topGlow} ${styles.wide}`}
              aria-hidden="true"
            />
            <div
              className={`${styles.topGlow} ${styles.short}`}
              aria-hidden="true"
            />
          </>
        }
      </div>
    );
  };

  if (aspect === Aspect.Gambit) {
    return (
      <div
        aria-hidden="true"
        className={`${styles.bannerContainer}`}
        data-aspect={aspect}
      >
        <div
          className={`${styles.banner} ${styles.bottom} ${styles.gambitColor}`}
          aria-hidden="true"
        />
        <div
          className={`${styles.banner} ${styles.top} ${styles.gambitColor}`}
          aria-hidden="true"
        />
        <div
          className={`${styles.banner} ${styles.gambit}`}
          aria-hidden="true"
          style={{
            backgroundImage: `url(${assetURL(ctx, `gambit/banner.${ASSET_VERSION}.png`)})`,
          }}
        />
      </div>
    );
  }

  return (
    <>
      {getBanner(false)}
      {getBanner(true)}
      {focus && (
        <div
          aria-hidden="true"
          className={`${styles.bannerContainer} ${rarity === Rarity.Legendary ? styles.legendary : ''}`}
          data-aspect={aspect}
        >
          {focusAwakened &&
            <div
              className={`${styles.banner} ${styles.focus} ${styles.bottom} ${getColorStyle(false, false)}`}
              aria-hidden="true"
              style={{
                backgroundImage: `url(${assetURL(ctx, `focus/banner-awakened.${ASSET_VERSION}.png`)})`,
              }}
            />
          }
          <div
            className={`${styles.banner} ${styles.focus} ${styles.top} ${getColorStyle(false, false)}`}
            aria-hidden="true"
            style={{
              backgroundImage: `url(${assetURL(ctx, `focus/${focusAwakened ? 'banner-awakened' : 'banner'}.${ASSET_VERSION}.png`)})`,
            }}
          />
        </div>
      )}
    </>
  );
}

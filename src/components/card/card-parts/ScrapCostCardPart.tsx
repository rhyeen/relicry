import styles from '../Card.module.css';
import { Aspect } from '@/entities/Aspect';
import { aspectAsArray } from './aspectsAsArray';
import { assetURL, CardContext } from '@/entities/CardContext';

type Props = {
  scrapCost: (Aspect | [Aspect, Aspect])[];
  ctx: CardContext;
}

export default function ScrapCostCardPart({ scrapCost, ctx }: Props) {
  const spreadCosts = scrapCost.map((aspect) => aspectAsArray(aspect));

  const getAspectColorImageUrl = (aspect: Aspect) => {
    const startPath = assetURL(ctx, 'scrap/scrap-');
    const endPath = `.1.png`;
    switch (aspect) {
      case Aspect.Brave:
        return `${startPath}red${endPath}`;
      case Aspect.Cunning:
        return `${startPath}green${endPath}`;
      case Aspect.Wise:
        return `${startPath}blue${endPath}`;
      case Aspect.Charming:
        return `${startPath}yellow${endPath}`;
      default:
        throw new Error(`Unknown card aspect: ${aspect}`);
    }
  };

  const getAspectSymbolImageUrl = (aspect: Aspect) => {
    const startPath = assetURL(ctx, 'scrap/scrap-');
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
      default:
        throw new Error(`Unknown card aspect: ${aspect}`);
    }
  };

  return (
    <div className={styles.scrapCostContainer}>
      {spreadCosts.map((cost, index) => {
        const sameAspect = cost[0] === cost[1];
        return (
          <div key={index} className={styles.scrapCost} data-aspect={sameAspect ? cost[0] : cost[0] + "/" + cost[1]}>
            <div
              className={styles.scrapCostTop}
              data-aspect={cost[0]}
              style={{
                backgroundImage: `url(${getAspectColorImageUrl(cost[0])})`,
              }}
            />
            <div
              className={styles.scrapCostBottom}
              data-aspect={cost[1]}
              style={{
                backgroundImage: `url(${getAspectColorImageUrl(cost[1])})`,
              }}
            />
            {sameAspect ?
              <div
                className={styles.scrapCostSingleAspectOverlay}
                style={{
                  backgroundImage: `url(${getAspectSymbolImageUrl(cost[0])})`,
                }}
              />
            :
              <div className={styles.scrapCostDualAspectOverlay}>
                <div
                  className={styles.scrapCostDualAspectOverlayTop}
                  style={{
                    backgroundImage: `url(${getAspectSymbolImageUrl(cost[0])})`,
                  }}
                />
                <div
                  className={styles.scrapCostDualAspectOverlayBottom}
                  style={{
                    backgroundImage: `url(${getAspectSymbolImageUrl(cost[1])})`,
                  }}
                />
              </div> 
            }
          </div>
        );
      })}
    </div>
  );
}

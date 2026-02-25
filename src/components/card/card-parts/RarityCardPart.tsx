import { assetURL, CardContext } from '@/entities/CardContext';
import { ASSET_VERSION } from '../assetVersion';
import styles from '../Card.module.css';
import { Rarity } from '@/entities/Rarity';
import { Aspect } from '@/entities/Aspect';
import { aspectAsArray } from './aspectsAsArray';

type Props = {
  aspect: Aspect | [Aspect, Aspect];
  rarity: Rarity;
  ctx: CardContext;
}

export default function RarityCardPart({
  aspect, rarity, ctx
}: Props) {
  const firstAspect = aspectAsArray(aspect)[0];

  const getRarityImageUrl = () => {
    switch (rarity) {
      case 'common':
        return `rarity/common.${ASSET_VERSION}.png`;
      case 'rare':
        return `rarity/common.${ASSET_VERSION}.png`;
      case 'epic':
        return `rarity/epic.${ASSET_VERSION}.png`;
      case 'legendary':
        return `rarity/legendary.${ASSET_VERSION}.png`;
      default:
        throw new Error(`Unknown card rarity: ${rarity}`);
    }
  };

  const getRarityGemImageUrl = () => {
    switch (rarity) {
      case 'common':
        return `rarity/common-gem.${ASSET_VERSION}.png`;
      case 'rare':
        return `rarity/rare-gem.${ASSET_VERSION}.png`;
      case 'epic':
        return `rarity/epic-gem.${ASSET_VERSION}.png`;
      case 'legendary':
        return `rarity/legendary-gem.${ASSET_VERSION}.png`;
      default:
        throw new Error(`Unknown card rarity: ${rarity}`);
    }
  };

  return (
    <>
      <div
        className={`${styles.rarity} ${styles[rarity]} ${styles[firstAspect]}`}
        data-rarity={rarity}
        style={{
          backgroundImage: `url(${assetURL(ctx, getRarityImageUrl())})`,
        }}
      >
      </div>
      <div
        className={`${styles.rarity} ${rarity === Rarity.Legendary ? `${styles[rarity]} ${styles[firstAspect]}` : ''}`}
        data-rarity={rarity}
        style={{
          backgroundImage: `url(${assetURL(ctx, getRarityGemImageUrl())})`,
        }}
        aria-label={`Rarity: ${rarity}`}
      >
        <div className={styles.rarityClickable} />
      </div>
    </>
  );
}
import { assetURL, CardContext } from '@/entities/CardContext';
import { ASSET_VERSION } from '../assetVersion';
import styles from '../Card.module.css';
import { Rarity } from '@/entities/Rarity';

type Props = {
  rarity: Rarity;
  ctx: CardContext;
}

export default function RarityCardPart({
  rarity, ctx
}: Props) {
  const getRarityImageUrl = () => {
    switch (rarity) {
      case 'common':
        return `rarity/common.${ASSET_VERSION}.png`;
      case 'rare':
        return `rarity/rare.${ASSET_VERSION}.png`;
      case 'epic':
        return `rarity/epic.${ASSET_VERSION}.png`;
      case 'legendary':
        return `rarity/legendary.${ASSET_VERSION}.png`;
      default:
        throw new Error(`Unknown card rarity: ${rarity}`);
    }
  };

  return (
    <div
      className={styles.rarity}
      data-rarity={rarity}
      style={{
        backgroundImage: `url(${assetURL(ctx, getRarityImageUrl())})`,
      }}
      aria-label={`Rarity: ${rarity}`}
    >
      <div className={styles.rarityClickable} />
    </div>
  );
}
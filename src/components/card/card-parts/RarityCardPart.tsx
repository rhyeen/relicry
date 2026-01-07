import { ASSET_VERSION } from '../assetVersion';
import styles from '../Card.module.css';
import { Rarity } from '@/entities/Rarity';

type Props = {
  rarity: Rarity;
}

export default function RarityCardPart({
  rarity
}: Props) {
  const getRarityImageUrl = () => {
    switch (rarity) {
      case 'common':
        return `/assets/card/rarity/common.${ASSET_VERSION}.png`;
      case 'rare':
        return `/assets/card/rarity/rare.${ASSET_VERSION}.png`;
      case 'epic':
        return `/assets/card/rarity/epic.${ASSET_VERSION}.png`;
      case 'legendary':
        return `/assets/card/rarity/legendary.${ASSET_VERSION}.png`;
      default:
        throw new Error(`Unknown card rarity: ${rarity}`);
    }
  };

  return (
    <div
      className={styles.rarity}
      data-rarity={rarity}
      style={{
        backgroundImage: `url(${getRarityImageUrl()})`,
      }}
      aria-label={`Rarity: ${rarity}`}
    >
      <div className={styles.rarityClickable} />
    </div>
  );
}
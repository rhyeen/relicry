import { Art } from '@/entities/Art';
import { Artist } from '@/entities/Artist';
import { VersionedCard, VersionedDeckCard } from '@/entities/Card';
import styles from './Card.module.css';
import RarityCardPart from './RarityCardPart';
import { ASSET_VERSION } from './assetVersion';
import QRTextureCardPart from './QRTextureCardPart';
import IllustrationCardPart from './IllustrationCardPart';
import BannerCardPart from './BannerCardPart';

type Props = {
  card: VersionedCard;
  art: Art | null;
  artist: Artist | null;
}

export default function FullDeckCard({
  card, art, artist
}: Props) {
  if (card.type !== 'deck') {
    throw new Error(`FullDeckCard can only render deck type cards, received: ${card.type}`);
  }
  const _card: VersionedDeckCard = card;
  return (
    <section className={styles.fullCard}>
      <IllustrationCardPart art={art} />
      <RarityCardPart rarity={_card.rarity} />
      <BannerCardPart aspect={_card.aspect} />
      <div
        className={styles.frame}
        style={{
          backgroundImage: `url(/assets/card/deck/frame.${ASSET_VERSION}.png)`,
        }}
        aria-hidden="true"
      />
      <QRTextureCardPart />
    </section>
  );
}

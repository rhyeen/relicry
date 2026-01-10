import { Art } from '@/entities/Art';
import { Artist } from '@/entities/Artist';
import { VersionedCard, VersionedDeckCard } from '@/entities/Card';
import styles from './Card.module.css';
import RarityCardPart from './card-parts/RarityCardPart';
import { ASSET_VERSION } from './assetVersion';
import QRTextureCardPart from './card-parts/QRTextureCardPart';
import IllustrationCardPart from './card-parts/IllustrationCardPart';
import BannerCardPart from './card-parts/BannerCardPart';
import QRCodeCardPart from './card-parts/QRCodeCardPart';
import DrawLimitCardPart from './card-parts/DrawLimitCardPart';
import TitleCardPart from './card-parts/TitleCardPart';
import HeaderCardPart from './card-parts/HeaderCardPart';
import DetailsCardPart from './card-parts/DetailsCardPart';
import ScrapCostCardPart from './card-parts/ScrapCostCardPart';
import AspectCardPart from './card-parts/AspectCardPart';
import TagsCardPart from './card-parts/TagsCardPart';

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
      <TagsCardPart tags={_card.tags} aspect={_card.aspect} />
      <AspectCardPart aspect={_card.aspect} />
      <DetailsCardPart card={_card} />
      <div
        className={styles.frame}
        style={{
          backgroundImage: `url(/assets/card/deck/frame.${ASSET_VERSION}.png)`,
        }}
        aria-hidden="true"
      />
      <HeaderCardPart artist={artist} card={card} />
      <DrawLimitCardPart drawLimit={_card.drawLimit} />
      <ScrapCostCardPart scrapCost={_card.scrapCost} />
      <TitleCardPart title={_card.title} subTitle={_card.subTitle} />
      <QRCodeCardPart card={card} />
      <QRTextureCardPart />
    </section>
  );
}

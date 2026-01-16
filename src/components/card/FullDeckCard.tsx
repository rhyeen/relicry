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
import { assetURL, CardContext, CardSize } from '@/entities/CardContext';

type Props = {
  card: VersionedCard;
  art: Art | null;
  artist: Artist | null;
  ctx: CardContext;
}

export default function FullDeckCard({
  card, art, artist, ctx
}: Props) {
  if (card.type !== 'deck') {
    throw new Error(`FullDeckCard can only render deck type cards, received: ${card.type}`);
  }
  const _card: VersionedDeckCard = card;
  return (
    <section className={`${styles.fullCard} ${ctx.size === CardSize.PrintSize ? styles.printSize : ''}`}>
      <IllustrationCardPart art={art} ctx={ctx} />
      <RarityCardPart rarity={_card.rarity} ctx={ctx} />
      <BannerCardPart aspect={_card.aspect} ctx={ctx} />
      <TagsCardPart tags={_card.tags} aspect={_card.aspect} ctx={ctx} />
      <AspectCardPart aspect={_card.aspect} ctx={ctx} />
      <DetailsCardPart card={_card} ctx={ctx} />
      <div
        className={styles.frame}
        style={{
          backgroundImage: `url(${assetURL(ctx, `deck/frame.${ASSET_VERSION}.png`)})`,
        }}
        aria-hidden="true"
      />
      <HeaderCardPart artist={artist} card={card} ctx={ctx} />
      <DrawLimitCardPart drawLimit={_card.drawLimit} ctx={ctx} />
      <ScrapCostCardPart scrapCost={_card.scrapCost} ctx={ctx} />
      <TitleCardPart title={_card.title} subTitle={_card.subTitle} ctx={ctx} />
      <QRCodeCardPart card={card} ctx={ctx} />
      <QRTextureCardPart ctx={ctx} />
    </section>
  );
}

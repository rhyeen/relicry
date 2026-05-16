import { Art } from '@/entities/Art';
import { Artist } from '@/entities/Artist';
import { VersionedDeckCard } from '@/entities/Card';
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
import { assetURL, CardContext } from '@/entities/CardContext';
import FoilShineOverlay from './card-parts/FoilShineOverlay';
import type { CardPartSelectionProps } from './cardExplanationParts';

type Props = CardPartSelectionProps & {
  card: VersionedDeckCard;
  art: Art | null;
  artist: Artist | null;
  ctx: CardContext;
}

export default function FullDeckCard({
  card, art, artist, ctx, selectedPart, onPartSelect
}: Props) {
  if (card.type !== 'deck') {
    throw new Error(`FullDeckCard can only render deck type cards, received: ${card.type}`);
  }
  return (
    <section
      className={`${styles.fullCard} ${ctx.hideCardPartInteractions ? styles.noInteractions : styles.interactions}`}
    >
      <IllustrationCardPart
        art={art}
        ctx={ctx}
        isSample={card.isSample}
        selectedPart={selectedPart}
        onPartSelect={onPartSelect}
      />
      <RarityCardPart
        rarity={card.rarity}
        aspect={card.aspect}
        ctx={ctx}
        selectedPart={selectedPart}
        onPartSelect={onPartSelect}
      />
      <BannerCardPart rarity={card.rarity} aspect={card.aspect} ctx={ctx} />
      <TagsCardPart tags={card.tags} aspect={card.aspect} ctx={ctx} selectedPart={selectedPart} onPartSelect={onPartSelect} />
      <AspectCardPart aspect={card.aspect} ctx={ctx} selectedPart={selectedPart} onPartSelect={onPartSelect} />
      <DetailsCardPart card={card} ctx={ctx} selectedPart={selectedPart} onPartSelect={onPartSelect} />
      <div
        className={styles.frame}
        style={{
          backgroundImage: `url(${assetURL(ctx, `deck/frame.${ASSET_VERSION}.png`)})`,
        }}
        aria-hidden="true"
      />
      <HeaderCardPart
        artist={artist}
        card={card}
        ctx={ctx}
        awakenedArtist={null}
        art={art}
        selectedPart={selectedPart}
        onPartSelect={onPartSelect}
      />
      <DrawLimitCardPart drawLimit={card.drawLimit} ctx={ctx} selectedPart={selectedPart} onPartSelect={onPartSelect} />
      <ScrapCostCardPart scrapCost={card.scrapCost} ctx={ctx} selectedPart={selectedPart} onPartSelect={onPartSelect} />
      <TitleCardPart
        rarity={card.rarity}
        title={card.title}
        subTitle={card.subTitle} ctx={ctx}
        aspect={card.aspect}
        selectedPart={selectedPart}
        onPartSelect={onPartSelect}
      />
      <QRCodeCardPart card={card} ctx={ctx} selectedPart={selectedPart} onPartSelect={onPartSelect} />
      <QRTextureCardPart ctx={ctx} />
      { card.version === 2 && <FoilShineOverlay /> }
    </section>
  );
}

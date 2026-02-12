import { Art } from '@/entities/Art';
import { Artist } from '@/entities/Artist';
import { VersionedFocusCard } from '@/entities/Card';
import styles from './Card.module.css';
import RarityCardPart from './card-parts/RarityCardPart';
import { ASSET_VERSION } from './assetVersion';
import QRTextureCardPart from './card-parts/QRTextureCardPart';
import IllustrationCardPart from './card-parts/IllustrationCardPart';
import BannerCardPart from './card-parts/BannerCardPart';
import QRCodeCardPart from './card-parts/QRCodeCardPart';
import TitleCardPart from './card-parts/TitleCardPart';
import HeaderCardPart from './card-parts/HeaderCardPart';
import DetailsCardPart from './card-parts/DetailsCardPart';
import AspectCardPart from './card-parts/AspectCardPart';
import TagsCardPart from './card-parts/TagsCardPart';
import { assetURL, CardContext } from '@/entities/CardContext';
import FoilShineOverlay from './card-parts/FoilShineOverlay';

type Props = {
  card: VersionedFocusCard;
  art: Art | null;
  artist: Artist | null;
  awakenedArt: Art | null;
  awakenedArtist: Artist | null;
  ctx: CardContext;
  awakened?: boolean;
}

export default function FullFocusCard({
  card, art, artist, awakenedArt, awakenedArtist, ctx, awakened
}: Props) {
  if (card.type !== 'focus') {
    throw new Error(`FullFocusCard can only render focus type cards, received: ${card.type}`);
  }
  const thisSide = awakened ? card.awakened : card;
  return (
    <section className={styles.fullCard}>
      <IllustrationCardPart art={art} awakenedArt={awakenedArt} ctx={ctx} focusAwakened={awakened} />
      <RarityCardPart rarity={card.rarity} aspect={card.aspect} ctx={ctx} />
      <BannerCardPart rarity={card.rarity} aspect={card.aspect} ctx={ctx} focus focusAwakened={awakened} />
      <TagsCardPart tags={thisSide.tags} aspect={card.aspect} ctx={ctx} />
      <AspectCardPart aspect={card.aspect} ctx={ctx} />
      <DetailsCardPart card={card} ctx={ctx} focusAwakened={awakened} />
      <div
        className={styles.frame}
        style={{
          backgroundImage: `url(${assetURL(ctx, `focus/frame${awakened ? '-awakened' : ''}.${ASSET_VERSION}.png`)})`,
        }}
        aria-hidden="true"
      />
      <HeaderCardPart artist={artist} awakenedArtist={awakenedArtist} card={card} ctx={ctx} focusAwakened={awakened} />
      <TitleCardPart
        rarity={card.rarity}
        title={card.title}
        subTitle={card.subTitle} ctx={ctx}
        aspect={card.aspect}
        focus
        focusAwakened={awakened}
      />
      <QRCodeCardPart card={card} ctx={ctx} />
      <QRTextureCardPart ctx={ctx} />
      {/* @DEBUG: Not sure when we'd apply foil */}
      { card.version === 2 && <FoilShineOverlay /> }
    </section>
  );
}

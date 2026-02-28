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
import TypeTitleCardPart from './card-parts/TypeTitleCardPart';
import { aspectAsArray } from './card-parts/aspectsAsArray';
import { Aspect } from '@/entities/Aspect';

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
  const firstAspect = aspectAsArray(card.aspect)[0];
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
          filter:
            firstAspect === Aspect.Cunning ? 'hue-rotate(155deg) saturate(0.8)' :
            firstAspect === Aspect.Wise ? 'hue-rotate(240deg) saturate(1.2) brightness(0.9)' :
            firstAspect === Aspect.Charming ? 'hue-rotate(50deg) brightness(1.5) contrast(1.3)' :
            'none',
        }}
        aria-hidden="true"
      />
      <TypeTitleCardPart type={card.type} ctx={ctx} />
      <HeaderCardPart
        artist={artist}
        awakenedArtist={awakenedArtist}
        card={card}
        ctx={ctx}
        focusAwakened={awakened}
        art={art}
      />
      <TitleCardPart
        rarity={card.rarity}
        title={card.title}
        subTitle={card.subTitle} ctx={ctx}
        aspect={card.aspect}
        focus
        focusAwakened={awakened}
      />
      {!awakened && <QRCodeCardPart card={card} ctx={ctx} />}
      {!awakened && <QRTextureCardPart ctx={ctx} />}
      {/* @DEBUG: Not sure when we'd apply foil */}
      { card.version === 2 && <FoilShineOverlay /> }
    </section>
  );
}

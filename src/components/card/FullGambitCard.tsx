import { Art } from '@/entities/Art';
import { Artist } from '@/entities/Artist';
import { VersionedGambitCard } from '@/entities/Card';
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
import { Aspect } from '@/entities/Aspect';
import TypeTitleCardPart from './card-parts/TypeTitleCardPart';
import type { CardPartSelectionProps } from './cardExplanationParts';

type Props = CardPartSelectionProps & {
  card: VersionedGambitCard;
  art: Art | null;
  artist: Artist | null;
  ctx: CardContext;
}

export default function FullGambitCard({
  card, art, artist, ctx, selectedPart, onPartSelect
}: Props) {
  if (card.type !== 'gambit') {
    throw new Error(`FullGambitCard can only render gambit type cards, received: ${card.type}`);
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
        aspect={Aspect.Gambit}
        ctx={ctx}
        selectedPart={selectedPart}
        onPartSelect={onPartSelect}
      />
      <BannerCardPart rarity={card.rarity} aspect={Aspect.Gambit} ctx={ctx} />
      <TagsCardPart tags={card.tags} aspect={Aspect.Gambit} ctx={ctx} selectedPart={selectedPart} onPartSelect={onPartSelect} />
      <AspectCardPart aspect={Aspect.Gambit} ctx={ctx} selectedPart={selectedPart} onPartSelect={onPartSelect} />
      <DetailsCardPart card={card} ctx={ctx} selectedPart={selectedPart} onPartSelect={onPartSelect} />
      <div
        className={styles.frame}
        style={{
          backgroundImage: `url(${assetURL(ctx, `gambit/frame.${ASSET_VERSION}.png`)})`,
        }}
        aria-hidden="true"
      />
      <TypeTitleCardPart type={card.type} ctx={ctx} selectedPart={selectedPart} onPartSelect={onPartSelect} />
      <HeaderCardPart
        artist={artist}
        awakenedArtist={null}
        card={card}
        ctx={ctx}
        art={art}
        selectedPart={selectedPart}
        onPartSelect={onPartSelect}
      />
      <TitleCardPart
        rarity={card.rarity}
        title={card.title}
        subTitle={card.subTitle} ctx={ctx}
        aspect={Aspect.Gambit}
        selectedPart={selectedPart}
        onPartSelect={onPartSelect}
      />
      <QRCodeCardPart card={card} ctx={ctx} selectedPart={selectedPart} onPartSelect={onPartSelect} />
      <QRTextureCardPart ctx={ctx} />
      { card.version === 2 && <FoilShineOverlay /> }
    </section>
  );
}

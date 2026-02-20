import cardStyles from '../card/Card.module.css';
import { ASSET_VERSION } from '../card/assetVersion';
import { assetURL, CardContext } from '@/entities/CardContext';
import FoilShineOverlay from '../card/card-parts/FoilShineOverlay';
import { VersionedQuest } from '@/entities/Quest';

type Props = {
  quest: VersionedQuest;
  side: 'front' | 'back';
  ctx: CardContext;
}

export default function FullQuestCard({
  quest, side, ctx
}: Props) {
  const frontImage = `quest/front-quest-frame-${quest.faction}.${ASSET_VERSION}.png`;
  const backImage = `quest/back-quest-frame.${ASSET_VERSION}.png`;
  return (
    <section className={cardStyles.fullCard}>
      <div
        className={cardStyles.frame}
        style={{
          backgroundImage: `url(${assetURL(ctx, side === 'front' ? frontImage : backImage)})`,
        }}
        aria-hidden="true"
      />
      { quest.version === 2 && <FoilShineOverlay /> }
    </section>
  );
}

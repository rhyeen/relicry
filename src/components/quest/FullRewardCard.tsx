import cardStyles from '../card/Card.module.css';
import { ASSET_VERSION } from '../card/assetVersion';
import { assetURL, CardContext } from '@/entities/CardContext';
import FoilShineOverlay from '../card/card-parts/FoilShineOverlay';
import { Reward } from '@/entities/Reward';

type Props = {
  reward: Reward;
  side: 'front' | 'back';
  foil?: boolean;
  ctx: CardContext;
}

export default function FullRewardCard({
  reward, side, foil, ctx
}: Props) {
  return (
    <section className={cardStyles.fullCard}>
      <div
        className={cardStyles.frame}
        style={{
          backgroundImage: `url(${assetURL(ctx, `quest/${side}-reward-frame-${reward.level}.${ASSET_VERSION}.png`)})`,
        }}
        aria-hidden="true"
      />
      { foil && <FoilShineOverlay /> }
    </section>
  );
}

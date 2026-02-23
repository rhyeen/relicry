import { Event } from '@/entities/Event';
import cardStyles from '../card/Card.module.css';
import styles from './RewardCard.module.css';
import { ASSET_VERSION } from '../card/assetVersion';
import { assetURL, CardContext } from '@/entities/CardContext';
import { getRewardId, Reward } from '@/entities/Reward';
import FooterCardPart from './card-parts/FooterCardPart';

type Props = {
  reward: Reward;
  side: 'front' | 'back';
  event: Event;
  ctx: CardContext;
}

const localeEn = {
  'reward': 'Reward',
  'toClaimAt': 'to claim at',
  'scanForReward': 'Scan for Reward',
};

export default function FullRewardCard({
  reward, side, ctx, event
}: Props) {
  const yearOfEvent = new Date(event.running.from).getUTCFullYear();
  const docId = getRewardId(reward.eventId, reward.level);
  const rewardLevelStyles = [
    styles.levelOne,
    styles.levelTwo,
    styles.levelThree,
  ][reward.level - 1] || '';
  return (
    <section className={`${cardStyles.fullCard} ${cardStyles.fullCardCropBleed} ${rewardLevelStyles}`}>
      <div
        className={cardStyles.frame}
        style={{
          backgroundImage: `url(${assetURL(ctx, `quest/${side}-reward-frame-${reward.level}.${ASSET_VERSION}.png`)})`,
        }}
        aria-hidden="true"
      />
      <div
        className={`${styles.challengeLevelNumber} ${styles[side]}`}
      >{reward.level}</div>
      {side === 'front' &&
        <>
          <div className={styles.bannerTitle}>{localeEn.reward}</div>
          <div className={styles.toClaimAt}>{localeEn.toClaimAt}</div>
          <div className={styles.eventName}>{event.title}</div>
          <div className={styles.eventYear}>{yearOfEvent}</div>
          <FooterCardPart color="white" ctx={ctx} id={getRewardId(reward.eventId, reward.level)} maxLength={13} />
        </>
      }
      {side === 'back' &&
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr-code?path=${encodeURIComponent(docId)}`}
            alt={`QR Code for claiming reward with doc ID ${docId}`}
            className={styles.qrcode}
          />
          <div className={styles.qrcodeColor} />
          <div className={styles.scanForReward}>{localeEn.scanForReward}</div>
        </>
      }
    </section>
  );
}

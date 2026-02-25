import cardStyles from '../card/Card.module.css';
import styles from './QuestCard.module.css';
import { ASSET_VERSION } from '../card/assetVersion';
import { assetURL, CardContext } from '@/entities/CardContext';
import { getQuestDocId, getQuestId, VersionedQuest } from '@/entities/Quest';
import FactionName from './card-parts/FactionName';
import FooterCardPart from './card-parts/FooterCardPart';

type Props = {
  quest: VersionedQuest;
  side: 'front' | 'back';
  ctx: CardContext;
}

const localeEn = {
  'quest': 'Quest',
  'challengeLevel': 'Challenge Level',
  'scanForQuest': 'Scan for Quest',
};

export default function FullQuestCard({
  quest, side, ctx
}: Props) {
  const frontImage = `quest/front-quest-frame-${quest.faction}.${ASSET_VERSION}.png`;
  const backImage = `quest/back-quest-frame.${ASSET_VERSION}.png`;
  const docId = getQuestDocId(quest.id, quest.season);
  return (
    <section className={`${cardStyles.fullCard} ${cardStyles.fullCardCropBleed} ${styles[quest.faction]}`}>
      <div
        className={cardStyles.frame}
        style={{
          backgroundImage: `url(${assetURL(ctx, side === 'front' ? frontImage : backImage)})`,
        }}
        aria-hidden="true"
      />
      {side === 'front' &&
        <>
          <div className={styles.questHeader}>{localeEn.quest}</div>
          <div className={styles.factionName}><FactionName faction={quest.faction} /></div>
          <div className={`${styles.challengeLevelNumber} ${quest.level === 1 ? styles.levelOne : ''}`}>{quest.level}</div>
          <div className={styles.challengeLevelLabel}>{localeEn.challengeLevel}</div>
          <FooterCardPart ctx={ctx} season={quest.season} id={getQuestId(quest.id)} />
        </>
      }
      {side === 'back' &&
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr-code?path=${encodeURIComponent(docId)}`}
            alt={`QR Code for ${docId}`}
            className={styles.qrcode}
          />
          <div className={styles.scanForQuest}>{localeEn.scanForQuest}</div>
        </>
      }
    </section>
  );
}

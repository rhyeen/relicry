import cardStyles from '../card/Card.module.css';
import styles from './QuestTokenCard.module.css';
import { ASSET_VERSION } from '../card/assetVersion';
import { assetURL, CardContext } from '@/entities/CardContext';
import { extractTokenRawId, getQuestTokenId, QuestToken } from '@/entities/Quest';
import FooterCardPart from './card-parts/FooterCardPart';
import FactionName from './card-parts/FactionName';

type Props = {
  token: QuestToken;
  // @NOTE: Quest tokens have the same front and back sides... for now.
  side: 'front' | 'back';
  ctx: CardContext;
}

const localeEn = {
  'questToken': 'Quest Token',
  'ofThe': 'of the',
};

const tokenNameLocaleEn: Record<string, string> = {
  '1': 'Broken Sword',
  '2': 'Heaven’s Fruit',
  '3': 'Brass Bell',
  '4': 'Secret Note',
  '5': 'Cursed Idol',
};

function getTokenName(token: QuestToken): string {
  const rawId = extractTokenRawId(token.id);
  return tokenNameLocaleEn[rawId] ?? 'Unknown Token';
}

export default function FullQuestTokenCard({
  token, ctx
}: Props) {
  return (
    <section className={`${cardStyles.fullCard} ${cardStyles.fullCardCropBleed} ${styles[token.faction]}`}>
      <div
        className={cardStyles.frame}
        style={{
          backgroundImage: `url(${assetURL(ctx, `quest/front-token-frame-${token.faction}.${ASSET_VERSION}.png`)})`,
        }}
        aria-hidden="true"
      />
      <div className={styles.tokenName}>{getTokenName(token)}</div>
      <div className={styles.bannerTitle}>{localeEn.questToken}</div>
      <div className={styles.ofThe}>{localeEn.ofThe}</div>
      <div className={styles.factionName}><FactionName faction={token.faction} /></div>
      <FooterCardPart ctx={ctx} season={token.season} id={getQuestTokenId(token.id)} />
    </section>
  );
}

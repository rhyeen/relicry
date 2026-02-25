import { assetURL, CardContext } from '@/entities/CardContext';
import styles from './CardTag.module.css';

type Props = {
  dataId: string;
  locale: string;
  straightLeft?: boolean;
  straightLeftLong?: boolean;
  backgroundColor: string;
  straightLeftColor?: string;
  whiteText?: boolean;
  auraNumber?: number;
  add?: '0' | '1/2';
  ctx: CardContext;
}

export default function CardTagLike({
  dataId,
  locale,
  straightLeft = false,
  straightLeftLong = false,
  backgroundColor,
  straightLeftColor,
  whiteText = false,
  auraNumber,
  add,
  ctx,
}: Props) {
  return (
    <span className={styles.tagContainer}>
      {(straightLeft || straightLeftLong) &&
        <span
          className={`${styles.straightLeft} ${straightLeftLong ? styles.straightLeftLong : ''}`}
          style={{ background: straightLeftColor || backgroundColor }}
          aria-hidden="true"
        >
          <span
            className={styles.tagTexture}
            style={{
              backgroundImage: `url(${assetURL(ctx, 'tag-texture.1.png')})`,
            }}
            aria-hidden="true"
          />
        </span>
      }
      <span
        className={`${styles.tag} ${whiteText ? styles.whiteText : ''} ${locale === '∞' ? styles.infinityTag : ''}`}
        style={{ background: backgroundColor }}
        data-taglike={dataId}
        aria-label={locale}
      >
        <span
          className={styles.tagTexture}
          style={{
            backgroundImage: `url(${assetURL(ctx, 'tag-texture.1.png')})`,
          }}
          aria-hidden="true"
        />
        {locale}
        {add === '1/2' &&
          <span className={styles.addHalf} aria-label=" ½">
            <span aria-hidden="true"> </span>
            <span className={styles.addHalf1} aria-hidden="true">1</span>
            <span className={styles.addHalfSlash} aria-hidden="true">/</span>
            <span className={styles.addHalf2} aria-hidden="true">2</span>
          </span>
        }
        {(add === '0') && <span className={styles.addZero} aria-label=" 0"> 0</span>}
        {auraNumber !== undefined && <span className={styles.tagAuraNumberSpacer} />}
      </span>
      {auraNumber !== undefined &&
        <span
          className={styles.tagAuraNumber}
        >
          <span
            className={styles.auraNumberIcon}
            style={{
              backgroundImage: `url(${assetURL(ctx, 'aura.1.png')})`,
            }}
            aria-hidden="true"
          />
          <span className={styles.auraNumber}>
            {auraNumber}
          </span>
        </span>
      }
    </span>
  );
}
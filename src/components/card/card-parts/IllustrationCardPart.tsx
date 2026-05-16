import { Art, IllustrationArt } from '@/entities/Art';
import styles from '../Card.module.css';
import { assetURL, CardContext, CardSize } from '@/entities/CardContext';
import { getCardPartInteractionProps, type CardPartSelectionProps } from '../cardExplanationParts';

type Props = CardPartSelectionProps & {
  art: Art | null;
  ctx: CardContext;
  awakenedArt?: Art | null;
  focusAwakened?: boolean;
  isSample?: boolean;
  showWatermark?: boolean;
}

const DEBUG_ALWAYS_SHOW_EXAMPLE = false;

export default function IllustrationCardPart({
  art,
  awakenedArt,
  ctx,
  focusAwakened,
  isSample,
  showWatermark,
  selectedPart,
  onPartSelect,
}: Props) {
  const _art = focusAwakened ? (awakenedArt || art) : art;
  let backgroundImage = assetURL(ctx, 'example-illustration.ai.webp');
  if (ctx.size === CardSize.PrintSize) {
    if (!DEBUG_ALWAYS_SHOW_EXAMPLE && (_art && _art.image && (_art as IllustrationArt).image.full?.url)) {
      backgroundImage = (_art as IllustrationArt).image.full?.url || '';
    }
  } else {
    if (!DEBUG_ALWAYS_SHOW_EXAMPLE && (_art && _art.image && (_art as IllustrationArt).image.card?.url)) {
      backgroundImage = (_art as IllustrationArt).image.card?.url || '';
    }
  }

  return (
    <div
      className={styles.illustration}
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div
        className={styles.illustrationClickable}
        {...getCardPartInteractionProps({
          disabled: ctx.hideCardPartInteractions,
          label: 'Explain card illustration',
          onPartSelect,
          part: 'illustration',
          selectedPart,
        })}
      />
      {(isSample && showWatermark) && <div className={styles.sampleWatermark} aria-hidden>Sample</div>}
      {isSample && <div className={styles.sampleTag} aria-label='This is a Sample Card'>Sample</div>}
    </div>
  );
}

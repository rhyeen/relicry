import { CardContext } from '@/entities/CardContext';
import styles from '../Card.module.css';
import { Rarity } from '@/entities/Rarity';
import { Aspect } from '@/entities/Aspect';
import { aspectAsArray } from './aspectsAsArray';
import { getCardPartInteractionProps, type CardPartSelectionProps } from '../cardExplanationParts';

type Props = CardPartSelectionProps & {
  title: string;
  subTitle?: string;
  ctx: CardContext;
  rarity: Rarity;
  aspect: Aspect | [Aspect, Aspect];
  focus?: boolean;
  focusAwakened?: boolean;
}

export default function TitleCardPart({
  title,
  subTitle,
  rarity,
  aspect,
  focus,
  focusAwakened,
  ctx,
  selectedPart,
  onPartSelect,
}: Props) { 
  const firstAspect = aspectAsArray(aspect)[0];
  const color = (focus && focusAwakened || aspect === Aspect.Gambit) ? 'black' :
    !focus ? 'white' :
      firstAspect === Aspect.Brave ? 'red' :
        firstAspect === Aspect.Cunning ? 'green' :
          firstAspect === Aspect.Wise ? 'blue' :
            firstAspect === Aspect.Charming ? 'yellow' :
              'white';
  const _rarity = (focus || aspect === Aspect.Gambit) ? Rarity.Common : rarity;
  return (
    <div
      className={`${styles.titleContainer} ${styles[_rarity]} ${styles[color]}`}
      {...getCardPartInteractionProps({
        disabled: ctx.hideCardPartInteractions,
        label: 'Explain card title',
        onPartSelect,
        part: 'title',
        selectedPart,
      })}
    >
      {aspect !== Aspect.Gambit && <div aria-label='Title' className={styles.title}>{title}</div>}
      {subTitle &&
        <div
          aria-label='Subtitle'
          className={`${styles.subtitle} ${aspect === Aspect.Gambit ? styles.gambitSubtitle : ''}`}
        >
          {subTitle}
        </div>
      }
      {aspect === Aspect.Gambit && <div aria-label='Title' className={`${styles.title} ${styles.gambitTitle}`}>{title}</div>}
    </div>
  );
}

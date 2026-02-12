import { CardContext } from '@/entities/CardContext';
import styles from '../Card.module.css';
import { Rarity } from '@/entities/Rarity';
import { Aspect } from '@/entities/Aspect';
import { aspectAsArray } from './aspectsAsArray';

type Props = {
  title: string;
  subTitle?: string;
  ctx: CardContext;
  rarity: Rarity;
  aspect: Aspect | [Aspect, Aspect];
  focus?: boolean;
  focusAwakened?: boolean;
}

export default function TitleCardPart({ title, subTitle, rarity, aspect, focus, focusAwakened }: Props) { 
  const firstAspect = aspectAsArray(aspect)[0];
  const color = (focus && focusAwakened || aspect === Aspect.Gambit) ? 'black' :
    !focus ? 'white' :
      firstAspect === Aspect.Brave ? 'red' :
        firstAspect === Aspect.Cunning ? 'green' :
          firstAspect === Aspect.Wise ? 'blue' :
            firstAspect === Aspect.Charming ? 'yellow' :
              'white';
  return (
    <div className={`${styles.titleContainer} ${styles[rarity]} ${styles[color]}`}>
      {aspect !== Aspect.Gambit && <div aria-label='Title' className={styles.title}>{title}</div>}
      {subTitle && <div aria-label='Subtitle' className={styles.subtitle}>{subTitle}</div>}
      {aspect === Aspect.Gambit && <div aria-label='Title' className={styles.title}>{title}</div>}
    </div>
  );
}

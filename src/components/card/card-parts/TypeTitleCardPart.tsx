import { CardContext } from '@/entities/CardContext';
import styles from '../Card.module.css';

type Props = {
  type: 'gambit' | 'focus';
  ctx: CardContext;
}

const localeEn = {
  'gambit': 'Gambit',
  'focus': 'Focus',
};

export default function TypeTitleCardPart({ type }: Props) { 
  const title = localeEn[type];
  return (
    <div
      className={`${styles.typeTitle} ${styles[type]}`}
      data-type={type}
      aria-label={title}
    >
      {title}
    </div>
  );
}

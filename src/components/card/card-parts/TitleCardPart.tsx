import { CardContext } from '@/entities/CardContext';
import styles from '../Card.module.css';

type Props = {
  title: string;
  subTitle?: string;
  ctx: CardContext;
}

export default function TitleCardPart({ title, subTitle }: Props) { 
  return (
    <div className={styles.titleContainer}>
      <div aria-label='Title' className={styles.title}>{title}</div>
      {subTitle && <div aria-label='Subtitle' className={styles.subtitle}>{subTitle}</div>}
    </div>
  );
}

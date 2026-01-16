import { CardContext } from '@/entities/CardContext';
import styles from '../Card.module.css';

type Props = {
  drawLimit: number;
  ctx: CardContext;
}

export default function DrawLimitCardPart({ drawLimit, ctx }: Props) { 
  return (
    <div aria-label='Draw Limit' className={styles.drawLimit}>{drawLimit}</div>
  );
}

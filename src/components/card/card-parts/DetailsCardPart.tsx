import { VersionedCard } from '@/entities/Card';
import styles from '../Card.module.css';
import FlavorTextCardPart from './FlavorTextCardPart';

type Props = {
  card: VersionedCard;
}

export default function DetailsCardPart({ card }: Props) {
  return (
    <div className={styles.details}>
      <FlavorTextCardPart flavorText={card.flavorText} />
    </div>
  );
}

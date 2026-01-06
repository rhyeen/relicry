import { getCardDocId, VersionedCard } from '@/entities/Card';
import styles from '../Card.module.css';
import { Artist } from '@/entities/Artist';

type Props = {
  artist: Artist | null;
  card: VersionedCard;
}

export default function HeaderCardPart({ artist, card }: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>{artist ? artist.name : 'Unknown Artist'}</div>
      <div className={styles.headerRight}>
        <span aria-label='Language'>EN</span>
        <span> • </span>
        <span aria-label='Season'>S{card.season}</span>
        <span> • </span>
        <span aria-label='Card ID'>{getCardDocId(card.id, card.version).toUpperCase()}</span>
        <span aria-label='Copyright'> © Relicry</span>
      </div>
    </div>
  );
}

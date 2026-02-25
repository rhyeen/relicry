import { getCardDocId, VersionedCard } from '@/entities/Card';
import styles from '../Card.module.css';
import { Artist } from '@/entities/Artist';
import { CardContext } from '@/entities/CardContext';
import { Art } from '@/entities/Art';

type Props = {
  art: Art | null;
  artist: Artist | null;
  awakenedArtist: Artist | null;
  card: VersionedCard;
  ctx: CardContext;
  focusAwakened?: boolean;
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 2) + '\u2026';
}

export default function HeaderCardPart({ art, artist, awakenedArtist, card, focusAwakened, ctx }: Props) {
  const displayArtist = art?.aIGenerated ? { name: 'AI Generated Art' } : focusAwakened ? awakenedArtist : artist;
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>{displayArtist ? displayArtist.name : 'Unknown Artist'}</div>
      <div className={styles.headerRight}>
        <span aria-label='Language'>{ctx.language ?? 'EN'}</span>
        <span> • </span>
        <span aria-label='Season'>S{card.season}</span>
        <span> • </span>
        <span aria-label='Card ID'>{truncate(getCardDocId(card.id, card.version).toUpperCase(), 7)}</span>
        <span aria-label='Copyright'> © Relicry</span>
      </div>
    </div>
  );
}

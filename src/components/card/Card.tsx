import { Art } from '@/entities/Art';
import { Artist } from '@/entities/Artist';
import { VersionedCard } from '@/entities/Card'
import FullDeckCard from './FullDeckCard';

type Props = {
  card: VersionedCard;
  art: Art | null;
  artist: Artist | null;
  type: 'full' | 'preview';
};

export default function Card({
  card, art, artist, type
}: Props) {
  if (type === 'preview') {
    throw new Error('Preview card view not implemented yet');
  } else if (type === 'full') {
    if (card.type === 'deck') {
      return <FullDeckCard card={card} art={art} artist={artist} />;
    } else {
      throw new Error(`Full card view not implemented for card type: ${card.type}`);
    }
  } else {
    throw new Error(`Unknown card type: ${type}`);
  }
}

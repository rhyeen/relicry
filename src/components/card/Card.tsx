import { Art } from '@/entities/Art';
import { Artist } from '@/entities/Artist';
import { VersionedCard } from '@/entities/Card'
import FullDeckCard from './FullDeckCard';
import { CardContext, CardType } from '@/entities/CardContext';

type Props = {
  card: VersionedCard;
  art: Art | null;
  artist: Artist | null;
  ctx: CardContext;
};

export default function Card({
  card, art, artist, ctx
}: Props) {
  if (ctx.type === CardType.Preview) {
    throw new Error('Preview card view not implemented yet');
  } else if (ctx.type === CardType.Full) {
    if (card.type === 'deck') {
      return <FullDeckCard card={card} art={art} artist={artist} ctx={ctx} />;
    } else {
      throw new Error(`Full card view not implemented for card type: ${card.type}`);
    }
  } else {
    throw new Error(`Unknown card type: ${ctx.type}`);
  }
}

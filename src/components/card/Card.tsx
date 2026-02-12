import { Art } from '@/entities/Art';
import { Artist } from '@/entities/Artist';
import { VersionedCard } from '@/entities/Card'
import FullDeckCard from './FullDeckCard';
import { CardContext, CardSize, CardType } from '@/entities/CardContext';
import styles from './Card.module.css';
import FullGambitCard from './FullGambitCard';
import FullFocusCard from './FullFocusCard';

type Props = {
  card: VersionedCard;
  art: Art | null;
  awakenedArt: Art | null;
  artist: Artist | null;
  awakenedArtist: Artist | null;
  flavorTextExtendedArt: Art | null;
  flavorTextExtendedArtist: Artist | null;
  awakenedFlavorTextExtendedArt: Art | null;
  awakenedFlavorTextExtendedArtist: Artist | null;
  awakened?: boolean;
  ctx: CardContext;
};

export default function Card({
  card, art, artist, ctx, awakenedArt, awakenedArtist, awakened
}: Props) {
  const getCard = () => {
    if (ctx.type === CardType.Preview) {
      throw new Error('Preview card view not implemented yet');
    } else if (ctx.type === CardType.Full) {
      if (card.type === 'deck') {
        return <FullDeckCard card={card} art={art} artist={artist} ctx={ctx} />;
      } else if (card.type === 'gambit') {
        return <FullGambitCard card={card} art={art} artist={artist} ctx={ctx} />;
      } else if (card.type === 'focus') {
        return (
          <FullFocusCard
            card={card}
            art={art}
            artist={artist}
            ctx={ctx}
            awakenedArt={awakenedArt}
            awakenedArtist={awakenedArtist}
            awakened={awakened}
          />
        );
      } else {
        throw new Error(`Full card view not implemented for card type: ${(card as VersionedCard).type}`);
      }
    } else {
      throw new Error(`Unknown card type: ${ctx.type}`);
    }
  };

  return (
    <div className={`${styles.cardContainer} ${ctx.size === CardSize.PrintSize ? styles.printSize : ''}`}>
      {getCard()}
    </div>
  );
}

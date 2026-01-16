import { VersionedCard } from '@/entities/Card';
import styles from '../Card.module.css';
import FlavorTextCardPart from './FlavorTextCardPart';
import EffectsCardPart from './EffectsCardPart';
import { CardContext } from '@/entities/CardContext';

type Props = {
  card: VersionedCard;
  ctx: CardContext;
}

export default function DetailsCardPart({ card, ctx }: Props) {
  return (
    <div className={styles.details}>
      <FlavorTextCardPart flavorText={card.flavorText} ctx={ctx} />
      <EffectsCardPart effects={card.effects} ctx={ctx} />
    </div>
  );
}

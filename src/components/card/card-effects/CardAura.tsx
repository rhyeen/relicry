import { CardContext } from '@/entities/CardContext';
import CardTagLike from './CardTagLike';

type Props = {
  aura: number | { from: number; to: number};
  ctx: CardContext;
}

export default function CardAura({
  aura, ctx,
}: Props) {
  return (
    <CardTagLike
      dataId={`AURA: ${typeof aura === 'number' ? aura : `${aura.from}-${aura.to}`}`}
      locale="Aura"
      backgroundColor="var(--auraGradient)"
      auraNumber={typeof aura === 'number' ? aura : 0}
      ctx={ctx}
    />
  );
}
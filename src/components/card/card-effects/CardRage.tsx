import { CardContext } from '@/entities/CardContext';
import CardTagLike from './CardTagLike';

type Props = {
  rage: number | { from: number; to: number};
  ctx: CardContext;
}

export default function CardRage({
  rage, ctx,
}: Props) {
  return (
    <CardTagLike
      dataId={`RAGE: ${typeof rage === 'number' ? rage : `${rage.from}-${rage.to}`}`}
      locale="Rage"
      backgroundColor="var(--rageGradient)"
      rageNumber={typeof rage === 'number' ? rage : 0}
      ctx={ctx}
    />
  );
}
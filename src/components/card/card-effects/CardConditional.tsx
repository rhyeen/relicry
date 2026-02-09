import { CardContext } from '@/entities/CardContext';
import CardTagLike from './CardTagLike';
import { Conditional } from '@/entities/Conditional';

type Props = {
  conditional: Conditional;
  straightLeft?: boolean;
  ctx: CardContext;
}

const tagLocaleEn = {
  [Conditional.Pvp]: 'Pvp?',
  [Conditional.Solo]: 'Solo?',
  [Conditional.Infinite]: '∞',
  [Conditional.TurnEnd]: 'Turn End?',
  [Conditional.DrawEnd]: 'Draw End?',
  [Conditional.React]: 'React',
}

export default function CardConditional({
  conditional, straightLeft = false, ctx,
}: Props) {
  const getBackgroundColor = () => {
    switch (conditional) {
      case Conditional.Pvp:
        return 'var(--pvpGradient)';
      case Conditional.Solo:
        return 'var(--soloGradient)';
      case Conditional.Infinite:
        return 'var(--infiniteGradient)';
      case Conditional.TurnEnd:
        return 'var(--turnEndGradient)';
      case Conditional.DrawEnd:
        return 'var(--drawEndGradient)';
      case Conditional.React:
        return 'var(--reactGradient)';
      default:
        throw new Error(`Unknown conditional: ${conditional}`);
    }
  };

  const getStraightLeftColor = () => {
    switch (conditional) {
      case Conditional.Pvp:
        return 'var(--pvpGradientLeft)';
      case Conditional.Solo:
        return 'var(--soloGradientLeft)';
      case Conditional.Infinite:
        return 'var(--infiniteGradientLeft)';
      case Conditional.TurnEnd:
        return 'var(--turnEndGradientLeft)';
      case Conditional.DrawEnd:
        return 'var(--drawEndGradientLeft)';
      case Conditional.React:
        return 'var(--reactGradientLeft)';
      default:
        throw new Error(`Unknown conditional: ${conditional}`);
    }
  };

  return (
    <CardTagLike
      dataId={conditional}
      locale={tagLocaleEn[conditional]}
      straightLeftLong={straightLeft}
      backgroundColor={getBackgroundColor()}
      straightLeftColor={getStraightLeftColor()}
      ctx={ctx}
    />
  );
}
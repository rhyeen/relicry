import CardTagLike from './CardTagLike';
import { Conditional } from '@/entities/Conditional';

type Props = {
  conditional: Conditional;
  straightLeft?: boolean;
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
  conditional, straightLeft = false,
}: Props) {
  const getBackgroundColor = () => {
    switch (conditional) {
      case Conditional.Pvp:
        return 'var(--pvpGradient)';
      case Conditional.Solo:
        return 'var(--soloGradient)';
      case Conditional.Infinite:
        return '#ffae3c';
      case Conditional.TurnEnd:
        return '#b354f2';
      case Conditional.DrawEnd:
        return '#61dcce';
      case Conditional.React:
        return '#877c9aff';
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
        return '#cc7a29';
      case Conditional.TurnEnd:
        return '#8e39c4';
      case Conditional.DrawEnd:
        return '#3ab6ad';
      case Conditional.React:
        return '#6b617d';
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
    />
  );
}
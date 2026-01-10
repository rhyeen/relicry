import CardTagLike from './CardTagLike';

type Props = {
  aura: number | { from: number; to: number};
}

export default function CardAura({
  aura,
}: Props) {
  return (
    <CardTagLike
      dataId={`AURA: ${typeof aura === 'number' ? aura : `${aura.from}-${aura.to}`}`}
      locale="Aura"
      backgroundColor="var(--auraGradient)"
      auraNumber={typeof aura === 'number' ? aura : 0}
    />
  );
}
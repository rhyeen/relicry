export enum Aspect {
  Brave = 'brave',
  Cunning = 'cunning',
  Wise = 'wise',
  Charming = 'charming',
}

const aspectOrder: Aspect[] = [
  Aspect.Brave,
  Aspect.Cunning,
  Aspect.Wise,
  Aspect.Charming,
];

const aspectComboOrder: [Aspect, Aspect][] = [
  [Aspect.Brave, Aspect.Cunning],
  [Aspect.Brave, Aspect.Wise],
  [Aspect.Cunning, Aspect.Wise],
  [Aspect.Wise, Aspect.Charming],
  [Aspect.Charming, Aspect.Brave],
  [Aspect.Charming, Aspect.Cunning],
];

export function orderAspects(aspects?: Aspect[]): Aspect[] {
  return (aspects ?? Object.values(Aspect)).sort((a, b) => {
    return aspectOrder.indexOf(a) - aspectOrder.indexOf(b);
  });
}

export function orderComboAspects(aspects?: [Aspect, Aspect][]): [Aspect, Aspect][] {
  return (aspects ?? aspectComboOrder).sort((a, b) => {
    const aIndex = aspectComboOrder.findIndex(
      (combo) => combo[0] === a[0] && combo[1] === a[1]
    );
    const bIndex = aspectComboOrder.findIndex(
      (combo) => combo[0] === b[0] && combo[1] === b[1]
    );
    return aIndex - bIndex;
  });
}

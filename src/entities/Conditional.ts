export enum Conditional {
  Pvp = 'pvp',
  Solo = 'solo',
  Infinite = 'infinite',
  TurnEnd = 'turnEnd',
  DrawEnd = 'drawEnd',
  React = 'react',
}

const conditionalOrder = [
  Conditional.Pvp,
  Conditional.Solo,
  Conditional.Infinite,
  Conditional.TurnEnd,
  Conditional.DrawEnd,
  Conditional.React,
];

export function orderConditionals(conditionals: Conditional[]): Conditional[] {
  return conditionals.sort(
    (a, b) => conditionalOrder.indexOf(a) - conditionalOrder.indexOf(b)
  );
}

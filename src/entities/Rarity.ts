export enum Rarity {
  Common = 'common',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
}

const rarityOrder = [
  Rarity.Common,
  Rarity.Rare,
  Rarity.Epic,
  Rarity.Legendary,
];

export function orderRarities(rarities?: Rarity[]): Rarity[] {
  return (rarities ?? Object.values(Rarity)).sort((a, b) => {
    return rarityOrder.indexOf(a) - rarityOrder.indexOf(b);
  });
}

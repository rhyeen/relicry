export enum Tag {
  Focus = 'focus',
  Gambit = 'gambit',
  Item = 'item',
  Ability = 'ability',
  Magic = 'magic',
  Scrap = 'scrap',
  Volant = 'volant',
  Void = 'void',
  Bling = 'bling',
  Blade = 'blade',
  Brew = 'brew',
  Tool = 'tool',
  Favor = 'favor',
  Weapon = 'weapon',
  Armor = 'armor',
  React = 'react',
}

const tagOrder = [
  Tag.Focus,
  Tag.Gambit,
  Tag.Item,
  Tag.Ability,
  Tag.Magic,
  Tag.Scrap,
  Tag.Volant,
  Tag.Void,
  Tag.Bling,
  Tag.Blade,
  Tag.Brew,
  Tag.Tool,
  Tag.Favor,
  Tag.Weapon,
  Tag.Armor,
  // @NOTE: React is intentionally not included as its only shown in card effects, like Force Field.
];

export function orderTags(tags?: Tag[], cardType?: "deck" | "focus" | "gambit"): Tag[] {
  return (tags ?? Object.values(Tag)).filter(tag => {
    if (cardType === 'deck') {
      return tag !== Tag.Focus && tag !== Tag.Gambit;
    } else if (cardType === 'focus') {
      return tag !== Tag.Gambit && tag !== Tag.Item && tag !== Tag.Ability;
    } else if (cardType === 'gambit') {
      return tag === Tag.Gambit;
    }
    return true;
  }).sort((a, b) => {
    return tagOrder.indexOf(a) - tagOrder.indexOf(b);
  });
}

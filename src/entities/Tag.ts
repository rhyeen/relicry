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
];

export function orderTags(tags?: Tag[]): Tag[] {
  return (tags ?? Object.values(Tag)).sort((a, b) => {
    return tagOrder.indexOf(a) - tagOrder.indexOf(b);
  });
}

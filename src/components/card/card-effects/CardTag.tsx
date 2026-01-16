import { Tag } from '@/entities/Tag';
import CardTagLike from './CardTagLike';
import { CardContext } from '@/entities/CardContext';

type Props = {
  tag: Tag;
  straightLeft?: boolean;
  ctx: CardContext;
}

const tagLocaleEn = {
  [Tag.Focus]: 'Focus',
  [Tag.Gambit]: 'Gambit',
  [Tag.Item]: 'Item',
  [Tag.Ability]: 'Ability',
  [Tag.Magic]: 'Magic',
  [Tag.Scrap]: 'Scrap',
  [Tag.Volant]: 'Volant',
  [Tag.Void]: 'Void',
  [Tag.Bling]: 'Bling',
  [Tag.Blade]: 'Blade',
  [Tag.Brew]: 'Brew',
  [Tag.Tool]: 'Tool',
  [Tag.Favor]: 'Favor',
  [Tag.Weapon]: 'Weapon',
  [Tag.Armor]: 'Armor',
}

export default function CardTag({
  tag, straightLeft = false, ctx,
}: Props) {
  const getBackgroundColor = () => {
    switch (tag) {
      case Tag.Focus:
        return '#404040';
      case Tag.Gambit:
        return '#c7c7c7ff';
      case Tag.Item:
        return '#ffae3c';
      case Tag.Ability:
        return '#b354f2';
      case Tag.Magic:
        return '#61dcce';
      case Tag.Scrap:
        return '#877c9aff';
      case Tag.Volant:
        return '#995dfaff';
      case Tag.Void:
        return '#5b0070ff';
      case Tag.Bling:
        return '#00d466';
      case Tag.Blade:
        return '#ff5959';
      case Tag.Brew:
        return '#ff6fc3ff';
      case Tag.Tool:
        return '#3590ffff';
      case Tag.Favor:
        return '#ffbab3ff';
      case Tag.Weapon:
        return '#c59684';
      case Tag.Armor:
        return '#ffa764ff';
      default:
        throw new Error(`Unknown tag: ${tag}`);
    }
  };

  return (
    <CardTagLike
      dataId={tag}
      locale={tagLocaleEn[tag]}
      straightLeft={straightLeft}
      backgroundColor={getBackgroundColor()}
      straightLeftColor={getBackgroundColor()}
      ctx={ctx}
    />
  );
}
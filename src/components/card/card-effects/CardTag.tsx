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
      case Tag.Gambit:
        return 'rgb(235, 235, 235)';
      case Tag.Focus:
        return '#3a3d49';
      case Tag.Scrap:
        return '#526285';
      case Tag.Weapon:
        return '#c59684';
      case Tag.Favor:
        return '#ff829b';
      case Tag.Blade:
        return '#fe4d47';
      case Tag.Armor:
        return '#ff6a25';
      case Tag.Item:
        return '#ffb300';
      case Tag.Brew:
        return '#bad300';
      case Tag.Volant:
        return '#00e450';
      case Tag.Magic:
        return '#00e2b1';
      case Tag.Tool:
        return '#599cff';
      case Tag.Void:
        return '#6200ca';
      case Tag.Ability:
        return '#c165ff';
      case Tag.Bling:
        return '#fe5fcc';
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
      add={
        tag === Tag.Scrap ? '1/2' :
        (tag === Tag.Void || tag === Tag.Focus || tag === Tag.Gambit) ? '0' : undefined
      }
      whiteText={tag === Tag.Focus || tag === Tag.Void}
      ctx={ctx}
    />
  );
}
import { Tag } from '@/entities/Tag';
import styles from './CardTag.module.css';

type Props = {
  tag: Tag;
  straightLeft?: boolean;
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
  tag, straightLeft = false,
}: Props) {
  return (
    <>
      {straightLeft &&
        <span className={`${styles.straightLeft} ${styles[`${tag.toLowerCase()}`]}`}>
          <span
            className={styles.tagTexture}
            style={{
              backgroundImage: `url(/assets/card/tag-texture.1.png)`,
            }}
          />
        </span>
      }
      <span
        className={`${styles.tag} ${styles[`${tag.toLowerCase()}`]}`}
        data-tag={tag}
        aria-label={`Tag: ${tagLocaleEn[tag]}`}
      >
        <span
          className={styles.tagTexture}
          style={{
            backgroundImage: `url(/assets/card/tag-texture.1.png)`,
          }}
        />
        {tagLocaleEn[tag]}
      </span>
    </>
  );
}
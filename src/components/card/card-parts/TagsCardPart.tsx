import { orderTags, Tag } from '@/entities/Tag';
import styles from '../Card.module.css';
import CardTag from '../card-effects/CardTag';
import { Aspect } from '@/entities/Aspect';
import { CardContext } from '@/entities/CardContext';

type Props = {
  tags: Tag[];
  aspect: Aspect | [Aspect, Aspect] | 'gambit';
  ctx: CardContext;
}

export default function TagsCardPart({
  tags, aspect, ctx
}: Props) {
  const twoAspects = Array.isArray(aspect) ? aspect.length === 2 : false;
  const sortedTags = orderTags(tags);
  const firstTag = sortedTags[0];
  const topRowTags = sortedTags.slice(6);
  const bottomRowTags = [ firstTag, ...sortedTags.slice(1, 6) ];

  return (
    <div className={`${styles.tagsContainer} ${twoAspects ? styles.tagsWithTwoAspects : ''}`}>
      <div className={`${styles.tags} ${styles.topRow}`}>
        {topRowTags.map((tag) => (
          <CardTag key={tag} tag={tag} ctx={ctx} />
        ))}
      </div>
      <div className={`${styles.tags} ${styles.bottomRow}`}>
        {bottomRowTags.map((tag, index) => (
          <CardTag key={tag} tag={tag} straightLeft={index === 0} ctx={ctx} />
        ))}
      </div>
    </div>
  );
}

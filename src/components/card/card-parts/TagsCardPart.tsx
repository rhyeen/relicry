import { Tag } from '@/entities/Tag';
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

  return (
    <div className={`${styles.tags} ${twoAspects ? styles.tagsWithTwoAspects : ''}`}>
      {tags.map((tag, index) => (
        <CardTag key={tag} tag={tag} straightLeft={index === 0} ctx={ctx} />
      ))}
    </div>
  );
}

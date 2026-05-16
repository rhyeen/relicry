import { orderTags, Tag } from '@/entities/Tag';
import styles from '../Card.module.css';
import CardTag from '../card-effects/CardTag';
import { Aspect } from '@/entities/Aspect';
import { CardContext } from '@/entities/CardContext';
import { getCardPartInteractionProps, type CardPartSelectionProps } from '../cardExplanationParts';

type Props = CardPartSelectionProps & {
  tags: Tag[];
  aspect: Aspect | [Aspect, Aspect] | 'gambit';
  ctx: CardContext;
}

export default function TagsCardPart({
  tags, aspect, ctx, selectedPart, onPartSelect
}: Props) {
  const twoAspects = Array.isArray(aspect) ? aspect.length === 2 : false;
  const sortedTags = orderTags(tags);
  const firstTag = sortedTags[0];
  const topRowTags = sortedTags.slice(6);
  const bottomRowTags = sortedTags.length === 0 ? [] : [ firstTag, ...sortedTags.slice(1, 6) ];

  return (
    <div
      className={`${styles.tagsContainer} ${twoAspects ? styles.tagsWithTwoAspects : ''}`}
      {...getCardPartInteractionProps({
        disabled: ctx.hideCardPartInteractions,
        label: 'Explain card tags',
        onPartSelect,
        part: 'tags',
        selectedPart,
      })}
    >
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

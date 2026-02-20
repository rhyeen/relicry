import { getCardDocId } from '@/entities/Card';
import cardStyles from '../../card/Card.module.css';
import { CardContext } from '@/entities/CardContext';

type Props = {
  ctx: CardContext;
  season?: number;
  id: string;
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 2) + '\u2026';
}

export default function FooterCardPart({ ctx, season, id }: Props) {
  return (
    <div className={cardStyles.footer}>
      <span aria-label='Language'>{ctx.language ?? 'EN'}</span>
      { season !== undefined && (
        <>
          <span> • </span>
          <span aria-label='Season'>S{season}</span>
        </>
      )}
      <div className={cardStyles.footerRight}>
        <span> • </span>
        <span aria-label='Card ID'>{truncate(getCardDocId(id, 1).toUpperCase(), 7)}</span>
        <span aria-label='Copyright'> © Relicry</span>
      </div>
    </div>
  );
}

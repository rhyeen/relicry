import cardStyles from '../../card/Card.module.css';
import { CardContext } from '@/entities/CardContext';

type Props = {
  ctx: CardContext;
  season?: number;
  id: string;
  color?: 'white' | 'black';
  maxLength?: number;
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 2) + '\u2026';
}

export default function FooterCardPart({ ctx, season, id, color = 'black', maxLength }: Props) {
  const maxIdLength = maxLength ?? (season !== undefined ? 5 : 7);
  return (
    <div className={`${cardStyles.footer} ${cardStyles[color]}`}>
      <div className={cardStyles.footerCenter}>
        <span aria-label='Language'>{ctx.language ?? 'EN'}</span>
        { season !== undefined && (
          <>
            <span>•</span>
            <span aria-label='Season'>S{season}</span>
          </>
        )}
        <span>•</span>
        <span aria-label='Card ID'>{truncate(id, maxIdLength).toUpperCase()}</span>
        <span aria-label='Copyright' style={{ marginLeft: '2px' }}> © Relicry</span>
      </div>
    </div>
  );
}

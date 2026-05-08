import { getCardDocId, VersionedCard } from '@/entities/Card';
import styles from '../Card.module.css';
import { CardContext, qrCodeApiURL } from '@/entities/CardContext';

type Props = {
  card: VersionedCard;
  ctx: CardContext;
}

export default function QRCodeCardPart({ card, ctx }: Props) {
  const cardPath = getCardDocId(card.id, card.version);
  const qrCodeSrc = qrCodeApiURL(ctx, cardPath);
  return (
    <div aria-label='QR Code' className={styles.qrcode}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrCodeSrc}
        alt={`QR Code for ${cardPath}`}
        width={93}
        height={93}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrCodeSrc}
        alt={`QR Code for ${cardPath}`}
        className={styles.qrcodeImageHover}
        width={93}
        height={93}
      />
    </div>
  );
}

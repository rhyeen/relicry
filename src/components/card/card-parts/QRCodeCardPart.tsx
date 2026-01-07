import { getCardDocId, VersionedCard } from '@/entities/Card';
import styles from '../Card.module.css';

type Props = {
  card: VersionedCard;
}

export default function QRCodeCardPart({ card }: Props) {
  const cardPath = getCardDocId(card.id, card.version);  
  return (
    <div aria-label='QR Code' className={styles.qrcode}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/qr-code?path=${encodeURIComponent(cardPath)}`}
        alt={`QR Code for ${cardPath}`}
        width={93}
        height={93}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/qr-code?path=${encodeURIComponent(cardPath)}`}
        alt={`QR Code for ${cardPath}`}
        className={styles.qrcodeImageHover}
        width={93}
        height={93}
      />
    </div>
  );
}

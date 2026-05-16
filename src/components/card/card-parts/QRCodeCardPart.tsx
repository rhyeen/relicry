import { getCardDocId, VersionedCard } from '@/entities/Card';
import styles from '../Card.module.css';
import { CardContext, qrCodeApiURL } from '@/entities/CardContext';
import { getCardPartInteractionProps, type CardPartSelectionProps } from '../cardExplanationParts';

type Props = CardPartSelectionProps & {
  card: VersionedCard;
  ctx: CardContext;
}

export default function QRCodeCardPart({ card, ctx, selectedPart, onPartSelect }: Props) {
  const cardPath = getCardDocId(card.id, card.version);
  const qrCodeSrc = qrCodeApiURL(ctx, cardPath);
  return (
    <div
      aria-label='QR Code'
      className={styles.qrcode}
      {...getCardPartInteractionProps({
        disabled: ctx.hideCardPartInteractions,
        label: 'Explain QR code',
        onPartSelect,
        part: 'qrCode',
        selectedPart,
      })}
    >
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

import { assetURL, CardContext } from '@/entities/CardContext';
import { ASSET_VERSION } from '../assetVersion';
import styles from '../Card.module.css';

type Props = {
  ctx: CardContext;
}

export default function QRTextureCardPart({ ctx }: Props) {
  return (
    <div
      className={styles.qrtexture}
      aria-hidden="true"
      style={{
        backgroundImage: `url(${assetURL(ctx, `qr-texture.${ASSET_VERSION}.png`)})`,
      }}
    />
  );
}

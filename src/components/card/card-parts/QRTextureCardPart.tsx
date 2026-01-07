import { ASSET_VERSION } from '../assetVersion';
import styles from '../Card.module.css';

export default function QRTextureCardPart() {
  return (
    <div
      className={styles.qrtexture}
      aria-hidden="true"
      style={{
        backgroundImage: `url(/assets/card/qr-texture.${ASSET_VERSION}.png)`,
      }}
    />
  );
}

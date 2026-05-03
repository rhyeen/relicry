"use client";

import Link from "next/link";
import DSText from "@/components/ds/DSText";
import { Art } from "@/entities/Art";
import { ImageSize, ImageStorage } from "@/entities/Image";
import StoredImage from "@/components/client/StoredImage";
import styles from "./PreviewItem.module.css";

type ArtPreviewItemProps = Readonly<{
  art: Art;
  href: string;
}>;

function getPreviewImage(art: Art): ImageStorage | null {
  if (art.type !== "illustration") return null;
  return (
    art.image?.[ImageSize.CardPreview] ||
    art.image?.[ImageSize.Card] ||
    art.image?.[ImageSize.CardFull] ||
    null
  );
}

export default function ArtPreviewItem({ art, href }: ArtPreviewItemProps) {
  const previewImage = getPreviewImage(art);
  const title = art.title?.trim() || "Untitled";

  return (
    <Link href={href} className={styles.root}>
      <div className={styles.imageWrap}>
        {previewImage ? (
          <StoredImage
            image={previewImage}
            size={{ width: 60, height: 60 }}
            alt={title}
          />
        ) : (
          <div className={styles.fallback}>
            <DSText.Caption>{art.type === "writing" ? "Text" : "No art"}</DSText.Caption>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <DSText.Body as="div" weight="semibold" className={styles.title}>{title}</DSText.Body>
        <DSText.Caption>Type: {art.type}</DSText.Caption>
        <DSText.Caption>Artist: {art.artistId || "—"}</DSText.Caption>
      </div>
    </Link>
  );
}

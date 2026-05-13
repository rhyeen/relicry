"use client";

import Link from "next/link";
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
  const typeLabel = labelize(art.type);
  const artistLabel = art.artistId || "Unassigned";
  const detailLabel = art.aIGenerated ? "AI generated" : "Original";

  return (
    <Link href={href} className={styles.root} data-type={art.type}>
      <div className={styles.artFrame}>
        {previewImage ? (
          <StoredImage
            image={previewImage}
            size={ImageSize.CardPreview}
            alt={title}
            className={styles.image}
          />
        ) : (
          <div className={styles.fallback}>
            {art.type === "writing" ? "Text" : "No art"}
          </div>
        )}
        <span className={styles.typeBadge} aria-hidden="true">{typeLabel}</span>
      </div>
      <div className={styles.content}>
        <span className={styles.detail}>{detailLabel}</span>
        <span className={styles.title}>{title}</span>
        {art.description ? (
          <span className={styles.description}>{art.description}</span>
        ) : null}
        <span className={styles.meta}>{artistLabel}</span>
      </div>
    </Link>
  );
}

function labelize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

"use client";

import Link from "next/link";
import { Art } from "@/entities/Art";
import { ImageSize, ImageStorage } from "@/entities/Image";
import StoredImage from "@/components/client/StoredImage";
import styles from "./ArtPreviewItem.module.css";

type ArtPreviewItemProps = Readonly<{
  art: Art;
  href: string;
  artistName?: string | null;
}>;

export function getArtPreviewImage(art: Art): ImageStorage | null {
  if (art.type !== "illustration") return null;
  return (
    art.image?.[ImageSize.CardPreview] ||
    art.image?.[ImageSize.Card] ||
    art.image?.[ImageSize.CardFull] ||
    null
  );
}

export default function ArtPreviewItem({ art, href }: ArtPreviewItemProps) {
  const previewImage = getArtPreviewImage(art);
  const title = art.title?.trim() || "Untitled";
  const description = art.description?.trim() || (art.type === "writing" ? art.markdown : "");

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
        ) : art.type === "writing" && description ? (
          <span className={styles.writingExcerpt}>{description}</span>
        ) : (
          <div className={styles.fallback}>
            {art.type === "writing" ? "Text" : "No art"}
          </div>
        )}
        {art.aIGenerated ? (
          <span className={styles.aiBadge} aria-label="AI generated">AI</span>
        ) : null}
      </div>
      <span className={styles.title}>{title}</span>
    </Link>
  );
}

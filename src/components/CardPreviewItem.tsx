"use client";

import Link from "next/link";
import DSText from "@/components/ds/DSText";
import { Art } from "@/entities/Art";
import { VersionedCard, VersionedDeckCard } from "@/entities/Card";
import { ImageSize, ImageStorage } from "@/entities/Image";
import StoredImage from "@/components/client/StoredImage";
import styles from "./PreviewItem.module.css";

type CardPreviewItemProps = Readonly<{
  card: VersionedCard;
  art: Art | null;
  href: string;
}>;

function getPreviewImage(art: Art | null): ImageStorage | null {
  if (!art || art.type !== "illustration") return null;
  return (
    art.image?.[ImageSize.CardPreview] ||
    art.image?.[ImageSize.Card] ||
    art.image?.[ImageSize.CardFull] ||
    null
  );
}

export default function CardPreviewItem({ card, art, href }: CardPreviewItemProps) {
  const previewImage = getPreviewImage(art);
  const drawLimit = "drawLimit" in card ? (card as VersionedDeckCard).drawLimit : undefined;
  const title = card.title?.trim() || "Untitled";
  const subTitle = card.subTitle?.trim();

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
            <DSText.Caption>No art</DSText.Caption>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <DSText.Body as="div" weight="semibold" className={styles.title}>
          {title}
          {subTitle ? <DSText.Body as="span" tone="muted" className={styles.subtitle}>— {subTitle}</DSText.Body> : null}
        </DSText.Body>
        <DSText.Caption>
          Rarity: {card.rarity}
        </DSText.Caption>
        <DSText.Caption>
          Draw Limit: {drawLimit ?? "—"}
        </DSText.Caption>
      </div>
    </Link>
  );
}

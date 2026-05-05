"use client";

import Link from "next/link";
import DSText from "@/components/ds/DSText";
import StoredImage from "@/components/client/StoredImage";
import { CardPreviewListItem } from "@/lib/cardsApi";
import styles from "./PreviewItem.module.css";

type CardPreviewItemProps = Readonly<{
  item: CardPreviewListItem;
}>;

export default function CardPreviewItem({ item }: CardPreviewItemProps) {
  const { card, href, previewImage } = item;
  const drawLimit = "drawLimit" in card ? card.drawLimit : undefined;
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

"use client";

import Link from "next/link";
import StoredImage from "@/components/client/StoredImage";
import { CardPreviewListItem } from "@/lib/cardsApi";
import { Aspect } from "@/entities/Aspect";
import { ImageSize } from "@/entities/Image";
import styles from "./CardPreviewItem.module.css";

type CardPreviewItemProps = Readonly<{
  item: CardPreviewListItem;
}>;

export default function CardPreviewItem({ item }: CardPreviewItemProps) {
  const { card, href, previewImage } = item;
  const drawLimit = "drawLimit" in card ? card.drawLimit : undefined;
  const title = card.title?.trim() || "Untitled";
  const subTitle = card.subTitle?.trim();
  const typeLabel = labelize(card.type);
  const rarityLabel = labelize(card.rarity);
  const aspects = getAspects(card.aspect);

  return (
    <Link
      href={href}
      className={styles.root}
      data-rarity={card.rarity}
      data-type={card.type}
    >
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
            No art
          </div>
        )}
        <span className={styles.cornerSignal} aria-label={drawLimit ? `Draw limit ${drawLimit}` : typeLabel}>
          {drawLimit ?? typeLabel.charAt(0)}
        </span>
        <span className={styles.typeBadge}>{typeLabel}</span>
      </div>
      <div className={styles.content}>
        <span className={styles.rarity}>{rarityLabel}</span>
        <span className={styles.title}>{title}</span>
        {subTitle ? <span className={styles.subtitle}>{subTitle}</span> : null}
        <span className={styles.metaRow}>
          {aspects.length > 0 ? (
            <span className={styles.aspects} aria-label={`Aspect ${aspects.map(labelize).join(', ')}`}>
              {aspects.map((aspect) => (
                <span
                  key={aspect}
                  className={styles.aspect}
                  data-aspect={aspect}
                  title={labelize(aspect)}
                />
              ))}
            </span>
          ) : (
            <span className={styles.gambitMark}>No aspect</span>
          )}
          {drawLimit ? (
            <span className={styles.metaText}>Draw {drawLimit}</span>
          ) : (
            <span className={styles.metaText}>{typeLabel}</span>
          )}
        </span>
      </div>
    </Link>
  );
}

function getAspects(aspect: CardPreviewListItem['card']['aspect']): Aspect[] {
  if (!aspect) return [];
  return Array.isArray(aspect) ? aspect : [aspect];
}

function labelize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

"use client";

import Link from "next/link";
import { Art } from "@/entities/Art";
import { VersionedCard, VersionedDeckCard } from "@/entities/Card";
import { ImageSize, ImageStorage } from "@/entities/Image";
import StoredImage from "@/components/client/StoredImage";

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
    <Link
      href={href}
      style={{
        display: "flex",
        gap: "12px",
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid #333333",
        textDecoration: "none",
        color: "inherit",
        background: "#000000",
      }}
    >
      <div style={{ width: 60, height: 60, flex: "0 0 60px" }}>
        {previewImage ? (
          <StoredImage
            image={previewImage}
            size={{ width: 60, height: 60 }}
            alt={title}
          />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "8px",
              background: "#19191b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: "#dadada",
            }}
          >
            No art
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontWeight: 600 }}>
          {title}
          {subTitle ? <span style={{ fontWeight: 400 }}> — {subTitle}</span> : null}
        </div>
        <div style={{ fontSize: "12px", color: "#555" }}>
          Rarity: {card.rarity}
        </div>
        <div style={{ fontSize: "12px", color: "#555" }}>
          Draw Limit: {drawLimit ?? "—"}
        </div>
      </div>
    </Link>
  );
}

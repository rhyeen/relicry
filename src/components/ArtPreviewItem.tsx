"use client";

import Link from "next/link";
import { Art } from "@/entities/Art";
import { ImageSize, ImageStorage } from "@/entities/Image";
import StoredImage from "@/components/client/StoredImage";

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
            {art.type === "writing" ? "Text" : "No art"}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: "12px", color: "#555" }}>Type: {art.type}</div>
        <div style={{ fontSize: "12px", color: "#555" }}>Artist: {art.artistId || "—"}</div>
      </div>
    </Link>
  );
}

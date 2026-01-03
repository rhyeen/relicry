"use client";
import { getImageHeight, getImageWidth, ImageSize, ImageStorage } from '@/entities/Image';
import { withStorage } from '@/lib/client/firebaseClient';
import { useEffect, useState } from 'react';

const urlCache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

export async function resolveUrlFromPath(path: string): Promise<string> {
  const cached = urlCache.get(path);
  if (cached) return cached;

  const existing = inflight.get(path);
  if (existing) return existing;

  const p = (async () => {
    const url = await withStorage(async ({ ref, getDownloadURL }, storage) => {
      return getDownloadURL(ref(storage, path));
    });
    urlCache.set(path, url);
    return url;
  })();

  inflight.set(path, p);
  try {
    return await p;
  } finally {
    inflight.delete(path);
  }
}


type Props = {
  image: ImageStorage;
  size: ImageSize | { width: number; height: number };
  alt?: string;
  className?: string;

  // Controls priority so images don’t fight HTML/JS/CSS:
  eager?: boolean; // use true only for above-the-fold “hero” images
};

export function StoredImage({
  image,
  size,
  alt = 'Untitled Image',
  className,
  eager = false,
}: Props) {
  // If url exists, use it immediately (no SDK call, no hydration wait).
  const initialSrc = image.url ?? (image.path ? urlCache.get(image.path) : undefined) ?? null;
  const [src, setSrc] = useState<string | null>(initialSrc);

  useEffect(() => {
    let alive = true;

    if (!src && image.path) {
      resolveUrlFromPath(image.path)
        .then((u) => alive && setSrc(u))
        .catch(() => {
          /* keep placeholder */
          console.error('Failed to load image from storage:', image.path);
        });
    }

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image.path, image.url]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src ?? undefined}
      alt={alt}
      width={getImageWidth(size)}
      height={getImageHeight(size)}
      className={className}
      decoding="async"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "low"}
      style={{
        backgroundColor: "#ff0000",
        display: "block",
      }}
    />
  );
}

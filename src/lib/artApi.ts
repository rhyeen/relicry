import type { Art } from '@/entities/Art';

export type ArtPreviewListItem = {
  art: Art;
  href: string;
  artistName: string | null;
};

export type ArtPreviewResponse = {
  items: ArtPreviewListItem[];
  page: number;
  totalPages: number;
  totalArts: number;
  pageSize: number;
};

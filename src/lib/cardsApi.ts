import { Aspect } from '@/entities/Aspect';
import { Rarity } from '@/entities/Rarity';
import { ImageStorage } from '@/entities/Image';
import { CardMetadata } from '@/lib/cardMetadata';

export type CardPreviewCard = {
  id: string;
  version: number;
  title: string;
  subTitle?: string;
  rarity: Rarity;
  type: 'deck' | 'focus' | 'gambit';
  drawLimit?: number;
  aspect?: Aspect | [Aspect, Aspect];
  scrapCost?: (Aspect | [Aspect, Aspect])[];
};

export type CardPreviewListItem = {
  card: CardPreviewCard;
  href: string;
  previewImage: ImageStorage | null;
};

export type CardsBaseResponse = {
  page: number;
  totalPages: number;
  totalCards: number;
  pageSize: number;
  nextCursor: string | null;
};

export type CardsMetadataResponse = CardsBaseResponse & {
  cards: CardMetadata[];
};

export type CardsPreviewResponse = CardsBaseResponse & {
  items: CardPreviewListItem[];
};

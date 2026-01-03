import { ImageSize } from './Image';
import { StoredRoot } from './Root';

export interface PromotedItem extends StoredRoot {
  // pi/a1b2c3d4e5
  id: string;
  artId: string | null;
  override: {
    // Order: override.title || art[artId]?.title
    title?: string;
    // Same order as title
    description?: string;
    imagePaths?: {
      [ImageSize.Thumb]?: string;
      [ImageSize.Custom]?: string;
    };
  };
  price: {
    currency: Currency;
    amount: number;
  } | null;
  purchaseUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export enum Currency {
  USD = 'USD',
}

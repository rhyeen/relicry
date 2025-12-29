import { LocaleMap } from './LocaleMap';

export interface PromotedItem {
  id: string;
  artId: string | null;
  override: {
    // Order: override.title || art[artId]?.title
    title?: LocaleMap;
    // Same order as title
    description?: LocaleMap;
    imageUrl?: string;
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

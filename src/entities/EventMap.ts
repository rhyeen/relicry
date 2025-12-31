import { StoredRoot } from './Root';

export interface EventMap extends StoredRoot {
  eventId: string;
  // map/a1b2c3d4e5
  id: string;
  imageUrl: string;
  imageWidthPx: number;
  imageHeightPx: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

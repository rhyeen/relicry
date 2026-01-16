import { prefixId, StoredRoot } from './Root';

export type EventMap = StoredRoot & {
  eventId: string;
  // map/a1b2c3d4e5
  id: string;
  imagePath: string;
  imageWidthPx: number;
  imageHeightPx: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export function getEventMapId(id: string): string {
  return prefixId('map', id);
}
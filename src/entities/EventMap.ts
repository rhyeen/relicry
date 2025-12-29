export interface EventMap {
  eventId: string;
  id: string;
  imageUrl: string;
  imageWidthPx: number;
  imageHeightPx: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

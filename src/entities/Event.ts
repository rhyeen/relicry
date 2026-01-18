import { ImageSize, ImageStorage } from './Image';
import { prefixId, StoredRoot } from './Root';

export type Event = StoredRoot & {
  // e/custom123; min-max after `e/` = 5-10 characters; case-insensitive alphanumeric
  id: string;
  title: string;
  description: string;
  running: {
    from: Date;
    to: Date;
  };
  image?: {
    [ImageSize.Banner]?: ImageStorage;
    [ImageSize.Thumb]?: ImageStorage;
  };
  // See EventMap for map details
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export function getEventId(id: string): string {
  return prefixId('e', id);
}

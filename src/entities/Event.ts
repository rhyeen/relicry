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
  starterDeckFocusCardIds: string[];
  // See EventMap for map details
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export function getEventId(id: string): string {
  return prefixId('e', id);
}

/**
 * @deprecated event ids are fully customizable to allow for a more memorable URL and branding.
 */
export function generateEventId(): string {
  throw new Error('Event IDs are now customizable and must be provided when creating an event. The generateEventId function is deprecated and should not be used.');
}

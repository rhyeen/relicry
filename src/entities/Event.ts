import { LocaleMap } from './LocaleMap';

export interface Event {
  // e/custom123; min-max after `e/` = 5-10 characters; case-insensitive alphanumeric
  id: string;
  title: LocaleMap;
  description: LocaleMap;
  running: {
    from: Date;
    to: Date;
  };
  imageUrl?: string;
  // See EventMap for map details
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

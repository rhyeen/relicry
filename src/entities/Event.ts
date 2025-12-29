import { LocaleMap } from './LocaleMap';

export interface Event {
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

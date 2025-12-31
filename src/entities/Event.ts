import { StoredRoot } from './Root';

export interface Event extends StoredRoot {
  // e/custom123; min-max after `e/` = 5-10 characters; case-insensitive alphanumeric
  id: string;
  title: string;
  description: string;
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

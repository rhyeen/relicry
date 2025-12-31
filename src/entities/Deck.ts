import { StoredRoot } from './Root';

export interface Deck {
  // dk/a1b2c3d4e5
  id: string;
  // each cardPathId is `${card.version}/${card.id}`
  cardPathIds: string[];
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

// A deck that has been versioned for tracking changes over time
export interface VersionedDeck extends Deck, StoredRoot {
  version: number;
}

export function getDeckDocId(id: string, version: number): string {
  return `${id}/${version}`;
}

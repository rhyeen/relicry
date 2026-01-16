import { prefixId, StoredRoot } from './Root';

export type Deck = {
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
export type VersionedDeck = Deck & StoredRoot & {
  version: number;
  isLatest: boolean;
}

export function getDeckId(id: string): string {
  return prefixId('dk', id);
}

export function getDeckDocId(id: string, version: number): string {
  return `${getDeckId(id)}/${version}`;
}

import { generateId } from '@/lib/idGenerator';
import { prefixId, StoredRoot } from './Root';

export type Deck = {
  // dk/a1b2c3d4e5
  id: string;
  // Each cardPathId is `${card.id}/${card.version}`, e.g. c/0003/1.
  // Repeated values represent multiple copies of the same card.
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

export function generateDeckId(): string {
  return getDeckId(generateId(10));
}

export function getDeckDocId(id: string, version: number): string {
  return `${getDeckId(id)}/${version}`;
}

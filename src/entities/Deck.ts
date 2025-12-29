export interface Deck {
  // each card is `${version}/${cardId}`
  cards: string[];
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

// A deck that has been versioned for tracking changes over time
export interface VersionedDeck extends Deck {
  version: number;
}
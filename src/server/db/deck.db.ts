import 'server-only';
import { getDeckDocId, getDeckId, VersionedDeck } from '@/entities/Deck';
import { RootDB } from './root.db';

export class DeckDB extends RootDB<VersionedDeck> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'decks');
  }

  protected prefixId(id: string): string {
    return getDeckId(id);
  }

  public getFromParts(id: string, version: number): Promise<VersionedDeck | null> {
    return this.get(getDeckDocId(id, version));
  }

  public async setAsLatest(deck: VersionedDeck): Promise<void> {
    const deckSets = [deck];
    deck.isLatest = true;
    const latestDeck = await this.getLatest(deck.id);
    if (!latestDeck) {
      deck.version = 1;
    } else {
      latestDeck.isLatest = false;
      deckSets.push(latestDeck);
      deck.version = latestDeck.version + 1;
    }
    await this.batchSet(deckSets);
  }

  public async getLatestByUser(userId: string): Promise<VersionedDeck[]> {
    return await this.getBy({
      where: [
        { field: 'userId', op: '==', value: userId },
        { field: 'isLatest', op: '==', value: true },
      ],
      sortBy: { field: 'updatedAt', direction: 'desc' },
      limit: 100,
    });
  }

  public async getLatest(id: string): Promise<VersionedDeck | null> {
    const entities = await this.getBy({
      where: [
        { field: 'id', op: '==', value: this.prefixId(id) },
        { field: 'isLatest', op: '==', value: true },
      ],
      sortBy: { field: 'id', direction: 'desc' },
      limit: 100,
    });
    // @NOTE: Data inconsistency check
    if (entities.length > 1) {
      entities.sort((a, b) => b.version - a.version);
      const [latest, ...rest] = entities;
      for (const entity of rest) {
        entity.isLatest = false;
      }
      await this.batchSet(rest);
      return latest;
    }
    if (entities.length === 1) {
      return entities[0];
    }
    // @NOTE: Fallback - in case data is inconsistent and no isLatest flag is set
    const entity = await this.getBy({
      where: [{ field: 'id', op: '==', value: this.prefixId(id) } ],
      sortBy: { field: 'version', direction: 'desc' },
      limit: 1,
    });
    if (entity.length === 0) {
      return null;
    }
    const [latestEntity] = entity;
    if (!latestEntity.isLatest) {
      latestEntity.isLatest = true;
      await this.set(latestEntity);
    }
    return latestEntity;
  }

  protected getUnsafeDocId(item: VersionedDeck): string {
    return getDeckDocId(item.id, item.version);
  }
}

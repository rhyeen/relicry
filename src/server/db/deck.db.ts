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

  public async getLatest(id: string): Promise<VersionedDeck | null> {
    const querySnapshot = await this.firestoreAdmin
      .collection(this.collectionName)
      .where('id', '==', this.prefixId(id))
      .orderBy('version', 'desc')
      .limit(1)
      .get();
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    return this.conformData(doc.data()) as VersionedDeck;
  }

  protected getUnsafeDocId(item: VersionedDeck): string {
    return getDeckDocId(item.id, item.version);
  }
}

import 'server-only';
import { getDeckDocId, VersionedDeck } from '@/entities/Deck';
import { RootDB } from './root.db';
import { conformId } from '@/lib/firestoreConform';

export class DeckDB extends RootDB<VersionedDeck> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'decks');
  }

  public getFromParts(id: string, version: number): Promise<VersionedDeck | null> {
    return this.get(getDeckDocId(id, version));
  }

  public async getLatest(id: string): Promise<VersionedDeck | null> {
    const querySnapshot = await this.firestoreAdmin
      .collection(this.collectionName)
      .where('id', '==', id)
      .orderBy('version', 'desc')
      .limit(1)
      .get();
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    return this.conformData(doc.data()) as VersionedDeck;
  }

  protected getDocId(item: VersionedDeck): string {
    return conformId(getDeckDocId(item.id, item.version));
  }
}

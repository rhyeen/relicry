import 'server-only';
import { getPlayerCardId, PlayerCard } from '@/entities/PlayerCard';
import { RootDB } from './root.db';
import { getUserId } from '@/entities/User';

export class PlayerCardDB extends RootDB<PlayerCard> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'playerCards');
  }

  protected prefixId(id: string): string {
    // @NOTE: Always performed as getPlayerCardId
    return id;
  }

  public getFromParts(userId: string, cardId: string, cardVersion: number): Promise<PlayerCard | null> {
    return this.get(getPlayerCardId(userId, cardId, cardVersion));
  }

  public async getByUserId(userId: string): Promise<PlayerCard[]> {
    const querySnapshot = await this.firestoreAdmin
      .collection(this.collectionName)
      .where('userId', '==', getUserId(userId))
      .limit(100)
      .get();
    if (querySnapshot.empty) {
      return [];
    }
    return querySnapshot.docs.map(doc => this.conformData(doc.data()) as PlayerCard);
  }

  protected getUnsafeDocId(item: PlayerCard): string {
    return getPlayerCardId(item.userId, item.cardId, item.cardVersion);
  }
}
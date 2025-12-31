import 'server-only';
import { getPlayerCardId, PlayerCard } from '@/entities/PlayerCard';
import { RootDB } from './root.db';
import { conformId } from '@/lib/firestoreConform';

export class PlayerCardDB extends RootDB<PlayerCard> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'playerCards');
  }

  public getFromParts(userId: string, cardId: string, cardVersion: number): Promise<PlayerCard | null> {
    return this.get(getPlayerCardId(userId, cardId, cardVersion));
  }

  public async getByUserId(userId: string): Promise<PlayerCard[]> {
    const querySnapshot = await this.firestoreAdmin
      .collection(this.collectionName)
      .where('userId', '==', userId)
      .limit(100)
      .get();
    if (querySnapshot.empty) {
      return [];
    }
    return querySnapshot.docs.map(doc => doc.data() as PlayerCard);
  }

  protected getDocId(item: PlayerCard): string {
    return conformId(getPlayerCardId(item.userId, item.cardId, item.cardVersion));
  }
}
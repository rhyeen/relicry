import 'server-only';
import { RootDB } from './root.db';
import { generateUniqueRewardId, getUniqueRewardId, UniqueReward } from '@/entities/Reward';
import { getEventId } from '@/entities/Event';

export class UniqueRewardDB extends RootDB<UniqueReward> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'uniqueRewards');
  }

  protected prefixId(id: string): string {
    return getUniqueRewardId(id);
  }

  public getFromParts(id: string): Promise<UniqueReward | null> {
    return this.get(id);
  }

  public async getByReward(eventId: string, level: number): Promise<UniqueReward[]> {
    return this.getBy({
      where: [
        { field: 'eventId', op: '==', value: getEventId(eventId) },
        { field: 'level', op: '==', value: level },
      ],
      sortBy: { field: 'id', direction: 'asc' },
      limit: 500,
    });
  }

  public async getByStoredDocId(docId: string): Promise<UniqueReward | null> {
    return this.firestoreAdmin
      .collection(this.collectionName)
      .doc(docId)
      .get()
      .then((doc) => (doc.exists
        ? this.conformData(doc.data()) as UniqueReward
        : null));
  }

  public async getNextUnpublishedByRewardAfter(eventId: string, level: number, cursor: string | null): Promise<{
    uniqueReward: UniqueReward | null;
    cursor: string | null;
  }> {
    const uniqueRewards = await this.getByReward(eventId, level);
    const nextUniqueReward = uniqueRewards.find((uniqueReward) => (
      !uniqueReward.published
      && !uniqueReward.archived
      && (!cursor || uniqueReward.id > cursor)
    )) ?? null;

    return {
      uniqueReward: nextUniqueReward,
      cursor: nextUniqueReward?.id ?? null,
    };
  }

  protected getUnsafeDocId(item: UniqueReward): string {
    return item.id;
  }

  public async generateId(level: number): Promise<string> {
    return this.getUniqueId(() => generateUniqueRewardId(level));
  }
}

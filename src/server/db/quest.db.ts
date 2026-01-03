import 'server-only';
import { getQuestDocId, getQuestId, VersionedQuest } from '@/entities/Quest';
import { RootDB } from './root.db';

export class QuestDB extends RootDB<VersionedQuest> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'quests');
  }

  protected prefixId(id: string): string {
    return getQuestId(id);
  }

  public getFromParts(id: string, season: number): Promise<VersionedQuest | null> {
    return this.get(getQuestDocId(id, season));
  }

  public async getLatest(id: string): Promise<VersionedQuest | null> {
    const querySnapshot = await this.firestoreAdmin
      .collection(this.collectionName)
      .where('id', '==', this.prefixId(id))
      .orderBy('season', 'desc')
      .limit(1)
      .get();
    if (querySnapshot.empty) {
      return null;
    }
    return querySnapshot.docs[0].data() as VersionedQuest;
  }

  protected getUnsafeDocId(item: VersionedQuest): string {
    return getQuestDocId(item.id, item.season);
  }
}
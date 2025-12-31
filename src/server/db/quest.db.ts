import 'server-only';
import { getQuestDocId, VersionedQuest } from '@/entities/Quest';
import { RootDB } from './root.db';
import { conformId } from '@/lib/firestoreConform';

export class QuestDB extends RootDB<VersionedQuest> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'quests');
  }

  public getFromParts(id: string, season: number): Promise<VersionedQuest | null> {
    return this.get(getQuestDocId(id, season));
  }

  public async getLatest(id: string): Promise<VersionedQuest | null> {
    const querySnapshot = await this.firestoreAdmin
      .collection(this.collectionName)
      .where('id', '==', id)
      .orderBy('season', 'desc')
      .limit(1)
      .get();
    if (querySnapshot.empty) {
      return null;
    }
    return querySnapshot.docs[0].data() as VersionedQuest;
  }

  protected getDocId(item: VersionedQuest): string {
    return conformId(getQuestDocId(item.id, item.season));
  }
}
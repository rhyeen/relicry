import 'server-only';
import { generateQuestId, getQuestDocId, getQuestId, VersionedQuest } from '@/entities/Quest';
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
    const entities = await this.getBy({
      where: [ { field: 'id', op: '==', value: this.prefixId(id) } ],
      sortBy: { field: 'season', direction: 'desc' },
      limit: 1,
    });
    return entities[0] ?? null;
  }

  protected getUnsafeDocId(item: VersionedQuest): string {
    return getQuestDocId(item.id, item.season);
  }

  public async generateId(): Promise<string> {
    return this.getUniqueId(generateQuestId);
  }
}

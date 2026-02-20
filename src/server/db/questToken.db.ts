import 'server-only';
import { getQuestDocId, getQuestTokenDocId, getTokenId, QuestToken } from '@/entities/Quest';
import { RootDB } from './root.db';
import { Faction } from '@/entities/Faction';

export class QuestTokenDB extends RootDB<QuestToken> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'questTokens');
  }

  protected prefixId(id: string): string {
    return getTokenId(id);
  }

  public getFromParts(id: string, questId: string, season: number): Promise<QuestToken | null> {
    return this.get(getQuestTokenDocId(id, questId, season));
  }

  public async getQuestTokens(questId: string, season: number): Promise<QuestToken[]> {
    const querySnapshot = await this.firestoreAdmin
      .collection(this.collectionName)
      .where('questId', '==', getQuestDocId(questId, season))
      .get();
    if (querySnapshot.empty) {
      return [];
    }
    return querySnapshot.docs.map(d => d.data() as QuestToken);
  } 

  /**
   * If we are retrieving an example quest card for printing, we only need the
   * defining characteristics of the token card as what quest it is tied to is irrelavant.
   */
  public async getAnyOfToken(
    id: string,
    faction?: Faction,
    season?: number,
  ): Promise<QuestToken | null> {
    let query = this.firestoreAdmin
      .collection(this.collectionName)
      .where('id', '==', this.prefixId(id));
    if (season !== undefined) {
      query = query.where('season', '==', season);
    }
    if (faction !== undefined) {
      query = query.where('faction', '==', faction);
    }
    // @NOTE: If season is not given, then grab the latest
    if (season === undefined) {
      query = query.orderBy('season', 'desc');
    }
    const querySnapshot = await query.limit(1).get();
    if (querySnapshot.empty) {
      return null;
    }
    return querySnapshot.docs[0].data() as QuestToken;
  }

  protected getUnsafeDocId(item: QuestToken): string {
    return getQuestTokenDocId(item.id, item.questId, item.season);
  }
}
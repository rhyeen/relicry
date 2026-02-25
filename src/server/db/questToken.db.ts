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
    return this.getBy({
      where: [ { field: 'questId', op: '==', value: getQuestDocId(questId, season) } ],
    });
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
    const where: { field: string; op: FirebaseFirestore.WhereFilterOp; value: string | number | boolean | Date }[] = [
      { field: 'id', op: '==', value: this.prefixId(id) },
    ];
    if (season !== undefined) {
      where.push({ field: 'season', op: '==', value: season });
    }
    if (faction !== undefined) {
      where.push({ field: 'faction', op: '==', value: faction });
    }
    const entities = await this.getBy({
      where,
      // @NOTE: If season is not given, then grab the latest
      sortBy: season === undefined ? { field: 'season', direction: 'desc' } : undefined,
      limit: 1,
    });
    return entities[0] ?? null;
  }

  protected getUnsafeDocId(item: QuestToken): string {
    return getQuestTokenDocId(item.id, item.questId, item.season);
  }
}

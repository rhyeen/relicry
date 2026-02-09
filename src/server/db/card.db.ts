import 'server-only';
import { RootDB } from './root.db';
import { generateCardId, getCardDocId, getCardId, VersionedCard } from '@/entities/Card';

export class CardDB extends RootDB<VersionedCard> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'cards');
  }

  protected prefixId(id: string): string {
    return getCardId(id);
  }

  public async getAllFeatured(index: number): Promise<{
    entities: VersionedCard[];
    index: number;
  }> {
    const entities = await this.getBy({
      where: [ { field: 'isFeatured', op: '==', value: true } ],
      sortBy: { field: 'revealedAt', direction: 'desc' },
      limit: 100,
    });
    return { entities, index: index + 1 };
  }

  public async getFeatured(id: string): Promise<VersionedCard[]> {
    return await this.getBy({
      where: [
        { field: 'isFeatured', op: '==', value: true },
        { field: 'id', op: '==', value: this.prefixId(id) },
      ],
      sortBy: { field: 'revealedAt', direction: 'desc' },
      limit: 100,
    });
  }

  public async feature(card: VersionedCard): Promise<void> {
    card.isFeatured = true;
    const featuredCards = await this.getFeatured(card.id);
    if (featuredCards.length > 0) {
      for (const featuredCard of featuredCards) {
        featuredCard.isFeatured = false;
      }
    }
    await this.batchSet([card, ...featuredCards]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected conformItemGet(item: any): VersionedCard {
    let _item = item;
    if (_item.scrapCost) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scrapCost = (_item.scrapCost as unknown[]).map((aspect: any) => {
        if (aspect.includes('/')) {
          const [aspect1, aspect2] = (aspect as string).split('/');
          return [aspect1, aspect2];
        }
        return aspect;
      });
      _item = { ..._item, scrapCost };
    }
    return _item as VersionedCard;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected conformItemSet(item: VersionedCard): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let _item: any = item;
    // @NOTE: Firestore doesn't support nested arrays, so we need to convert [Aspect, Aspect] to "Aspect/Aspect"
    if (_item.scrapCost) {
      const scrapCost = (_item.scrapCost as (string | [string, string])[]).map((aspect) => {
        if (Array.isArray(aspect)) {
          return aspect.join('/');
        }
        return aspect;
      });
      _item = { ..._item, scrapCost };
    }
    return _item;
  }

  public getFromParts(id: string, version: number): Promise<VersionedCard | null> {
    return this.get(getCardDocId(id, version));
  }

  protected getUnsafeDocId(item: VersionedCard): string {
    return getCardDocId(item.id, item.version);
  }

  /**
   * @param isSample If the card is a sample card, the ID is significantly longer
   * to prevent web scrapers from attempting to discover unrevealed cards.
   */
  public async generateId(isSample: boolean): Promise<string> {
    return this.getUniqueId(() => generateCardId(isSample));
  }
}
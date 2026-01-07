import 'server-only';
import { RootDB } from './root.db';
import { getCardDocId, getCardId, VersionedCard } from '@/entities/Card';

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

  public getFromParts(id: string, version: number): Promise<VersionedCard | null> {
    return this.get(getCardDocId(id, version));
  }

  protected getUnsafeDocId(item: VersionedCard): string {
    return getCardDocId(item.id, item.version);
  }
}
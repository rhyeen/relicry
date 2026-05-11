import 'server-only';
import { RootDB } from './root.db';
import { generateCardId, getCardDocId, getCardId, VersionedCard } from '@/entities/Card';
import { conformDocId } from '@/lib/firestoreConform';
import { FieldPath, Timestamp } from 'firebase-admin/firestore';
import { CardListAspectFilter, CardListTypeFilter, CARDS_PAGE_SIZE } from '@/lib/cardsList';
import {
  buildAspectFilterKeys,
  buildCardAspectKey,
  buildCardTitlePrefixes,
  normalizeCardTitleQuery,
} from '@/lib/cardQueryFields';

type FeaturedCardsFilters = {
  query: string;
  type: CardListTypeFilter;
  aspect: CardListAspectFilter;
  cursor: string | null;
};

type FeaturedCardsPage = {
  cards: VersionedCard[];
  totalCards: number;
  totalPages: number;
  nextCursor: string | null;
};

export class CardDB extends RootDB<VersionedCard> {
  private static readonly FEATURED_BATCH_SIZE = 200;

  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'cards');
  }

  protected prefixId(id: string): string {
    return getCardId(id);
  }

  public async getFeaturedPage(filters: FeaturedCardsFilters): Promise<FeaturedCardsPage> {
    const countQuery = this.applyFeaturedFilters(filters);
    const pageQuery = this
      .applyFeaturedSorting(this.applyFeaturedFilters(filters))
      .limit(CARDS_PAGE_SIZE + 1);
    const pagedQuery = this.applyFeaturedCursor(pageQuery, filters.cursor);

    const [countSnapshot, querySnapshot] = await Promise.all([
      countQuery.count().get(),
      pagedQuery.get(),
    ]);
    const docs = querySnapshot.docs;
    const hasNext = docs.length > CARDS_PAGE_SIZE;
    const pageDocs = hasNext ? docs.slice(0, CARDS_PAGE_SIZE) : docs;
    const totalCards = Number(countSnapshot.data().count);

    return {
      cards: pageDocs.map((doc) => this.conformItemGet(this.conformData(doc.data()) as VersionedCard)),
      totalCards,
      totalPages: Math.max(1, Math.ceil(totalCards / CARDS_PAGE_SIZE)),
      nextCursor: hasNext ? this.serializeCursor(pageDocs[pageDocs.length - 1]!) : null,
    };
  }

  public async getLatestFeatured(limit: number): Promise<VersionedCard[]> {
    const querySnapshot = await this
      .applyFeaturedSorting(this.applyFeaturedFilters({
        query: '',
        type: 'all',
        aspect: 'all',
        cursor: null,
      }))
      .limit(limit)
      .get();

    return querySnapshot.docs.map((doc) => this.conformItemGet(this.conformData(doc.data()) as VersionedCard));
  }

  public async getFeaturedFocusCards(limit = 100): Promise<VersionedCard[]> {
    return this.getBy({
      where: [
        { field: 'isFeatured', op: '==', value: true },
        { field: 'type', op: '==', value: 'focus' },
      ],
      sortBy: { field: 'revealedAt', direction: 'desc' },
      limit,
    });
  }

  public async getAllFeatured(index: number): Promise<{
    entities: VersionedCard[];
    index: number;
  }> {
    const entities: VersionedCard[] = [];
    let offset = 0;

    while (true) {
      const page = await this.getBy({
        where: [{ field: 'isFeatured', op: '==', value: true }],
        sortBy: { field: 'revealedAt', direction: 'desc' },
        limit: CardDB.FEATURED_BATCH_SIZE,
        offset,
      });
      entities.push(...page);
      if (page.length < CardDB.FEATURED_BATCH_SIZE) {
        break;
      }
      offset += page.length;
    }

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

  public async getByStoredDocId(docId: string): Promise<VersionedCard | null> {
    return this.firestoreAdmin
      .collection(this.collectionName)
      .doc(docId)
      .get()
      .then((doc) => (doc.exists
        ? this.conformItemGet(this.conformData(doc.data()) as VersionedCard)
        : null));
  }

  public getStoredDocIdForCard(cardId: string, version: number): string {
    return conformDocId(getCardDocId(cardId, version));
  }

  public async getNextUnpublishedAfter(cursor: string | null): Promise<{
    card: VersionedCard | null;
    cursor: string | null;
  }> {
    let query: FirebaseFirestore.Query = this.firestoreAdmin
      .collection(this.collectionName)
      .where('publishedAt', '==', null)
      .orderBy(FieldPath.documentId())
      .limit(1);

    if (cursor) {
      query = query.startAfter(cursor);
    }

    const querySnapshot = await query.get();
    const [doc] = querySnapshot.docs;

    if (!doc) {
      return {
        card: null,
        cursor: null,
      };
    }

    return {
      card: this.conformItemGet(this.conformData(doc.data()) as VersionedCard),
      cursor: doc.id,
    };
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
    _item = {
      ..._item,
      queryAspectKey: item.type === 'gambit' ? null : buildCardAspectKey(item.aspect),
      queryTitlePrefixes: buildCardTitlePrefixes(item.title),
    };
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

  private applyFeaturedCursor(
    query: FirebaseFirestore.Query,
    cursor: string | null,
  ): FirebaseFirestore.Query {
    if (!cursor) {
      return query;
    }

    const { revealedAt, docId } = this.parseCursor(cursor);
    return query.startAfter(revealedAt ? Timestamp.fromDate(revealedAt) : null, docId);
  }

  private applyFeaturedFilters(filters: FeaturedCardsFilters): FirebaseFirestore.Query {
    let query: FirebaseFirestore.Query = this.firestoreAdmin
      .collection(this.collectionName)
      .where('isFeatured', '==', true);

    if (filters.type !== 'all') {
      query = query.where('type', '==', filters.type);
    }

    if (filters.aspect !== 'all') {
      query = query.where('queryAspectKey', 'in', buildAspectFilterKeys(filters.aspect));
    }

    const normalizedTitle = normalizeCardTitleQuery(filters.query);
    if (normalizedTitle) {
      query = query.where('queryTitlePrefixes', 'array-contains', normalizedTitle);
    }

    return query;
  }

  private applyFeaturedSorting(query: FirebaseFirestore.Query): FirebaseFirestore.Query {
    return query
      .orderBy('revealedAt', 'desc')
      .orderBy(FieldPath.documentId(), 'desc');
  }

  private parseCursor(cursor: string): { revealedAt: Date | null; docId: string } {
    const [revealedAtValue, ...docIdParts] = cursor.split('::');
    const docId = docIdParts.join('::').trim();
    const revealedAt = revealedAtValue === 'null' ? null : new Date(revealedAtValue);

    if (!docId) {
      throw new Error(`Invalid cards cursor: ${cursor}`);
    }

    if (revealedAtValue !== 'null' && Number.isNaN(revealedAt?.getTime())) {
      throw new Error(`Invalid cards cursor timestamp: ${cursor}`);
    }

    return { revealedAt, docId };
  }

  private serializeCursor(doc: FirebaseFirestore.QueryDocumentSnapshot): string {
    const revealedAt = doc.get('revealedAt');
    const timestamp = revealedAt instanceof Timestamp
      ? revealedAt.toDate().toISOString()
      : revealedAt instanceof Date
        ? revealedAt.toISOString()
        : 'null';

    return `${timestamp}::${doc.id}`;
  }
}

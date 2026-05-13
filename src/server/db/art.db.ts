import 'server-only';
import { Art, generateArtId, getArtId } from '@/entities/Art';
import { RootDB } from './root.db';
import { ART_PAGE_SIZE, ArtListGenerationFilter, ArtListTypeFilter, parseArtSearchQuery } from '@/lib/artList';
import { buildSearchPrefixes } from '@/lib/searchQueryFields';
import { FieldPath, Timestamp } from 'firebase-admin/firestore';

type ArtPageFilters = {
  query: string;
  type: ArtListTypeFilter;
  generation: ArtListGenerationFilter;
  cursor: string | null;
};

type ArtPage = {
  arts: Art[];
  totalArts: number;
  totalPages: number;
  nextCursor: string | null;
};

export class ArtDB extends RootDB<Art> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'arts');
  }

  protected prefixId(id: string): string {
    return getArtId(id);
  }

  public getFromParts(id: string): Promise<Art | null> {
    return this.get(id);
  }

  protected getUnsafeDocId(item: Art): string {
    return item.id;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected conformItemSet(item: Art): any {
    return {
      ...item,
      queryTitlePrefixes: buildSearchPrefixes(item.title),
    };
  }

  public async getPreviewPage(
    filters: ArtPageFilters,
    artistNameSearchIds: string[],
  ): Promise<ArtPage> {
    const search = parseArtSearchQuery(filters.query);
    const artistIds = [...new Set([...search.artistIds, ...artistNameSearchIds])];

    if (search.idOnly || search.artIds.length > 0 || artistIds.length > 0 || search.normalizedText) {
      return this.getPreviewPageWithExpandedSearch(filters, {
        ...search,
        artistIds,
      });
    }

    const countQuery = this.applyPreviewFilters(filters);
    const pageQuery = this
      .applyPreviewSorting(this.applyPreviewFilters(filters))
      .limit(ART_PAGE_SIZE + 1);
    const pagedQuery = this.applyPreviewCursor(pageQuery, filters.cursor);

    const [countSnapshot, querySnapshot] = await Promise.all([
      countQuery.count().get(),
      pagedQuery.get(),
    ]);
    const docs = querySnapshot.docs;
    const hasNext = docs.length > ART_PAGE_SIZE;
    const pageDocs = hasNext ? docs.slice(0, ART_PAGE_SIZE) : docs;
    const totalArts = Number(countSnapshot.data().count);

    return {
      arts: pageDocs.map((doc) => this.conformItemGet(this.conformData(doc.data()) as Art)),
      totalArts,
      totalPages: Math.max(1, Math.ceil(totalArts / ART_PAGE_SIZE)),
      nextCursor: hasNext ? this.serializeCursor(pageDocs[pageDocs.length - 1]!) : null,
    };
  }

  public async generateId(): Promise<string> {
    return this.getUniqueId(generateArtId);
  }

  private applyPreviewFilters(filters: ArtPageFilters): FirebaseFirestore.Query {
    let query: FirebaseFirestore.Query = this.firestoreAdmin.collection(this.collectionName);

    if (filters.type !== 'all') {
      query = query.where('type', '==', filters.type);
    }

    if (filters.generation === 'ai') {
      query = query.where('aIGenerated', '==', true);
    } else if (filters.generation === 'original') {
      query = query.where('aIGenerated', '==', false);
    }

    return query;
  }

  private async getPreviewPageWithExpandedSearch(
    filters: ArtPageFilters,
    search: ReturnType<typeof parseArtSearchQuery>,
  ): Promise<ArtPage> {
    const queryPromises: Promise<FirebaseFirestore.QuerySnapshot>[] = [];
    const collection = this.firestoreAdmin.collection(this.collectionName);

    if (!search.idOnly && search.normalizedText) {
      queryPromises.push(
        collection.where('queryTitlePrefixes', 'array-contains', search.normalizedText).get(),
      );
    }

    for (const artIdChunk of chunkValues(search.artIds)) {
      queryPromises.push(
        collection.where('id', 'in', artIdChunk).get(),
      );
    }

    for (const artistIdChunk of chunkValues(search.artistIds)) {
      queryPromises.push(
        collection.where('artistId', 'in', artistIdChunk).get(),
      );
    }

    if (queryPromises.length === 0) {
      return {
        arts: [],
        totalArts: 0,
        totalPages: 1,
        nextCursor: null,
      };
    }

    const snapshots = await Promise.all(queryPromises);
    const docsById = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
    for (const snapshot of snapshots) {
      snapshot.docs.forEach((doc) => {
        docsById.set(doc.id, doc);
      });
    }

    const matchedDocs = [...docsById.values()]
      .filter((doc) => this.matchesPreviewFilters(doc, filters))
      .sort(compareArtDocs);
    const startIndex = filters.cursor
      ? matchedDocs.findIndex((doc) => this.serializeCursor(doc) === filters.cursor) + 1
      : 0;
    const pageStartIndex = Math.max(0, startIndex);
    const docs = matchedDocs.slice(pageStartIndex, pageStartIndex + ART_PAGE_SIZE + 1);
    const hasNext = docs.length > ART_PAGE_SIZE;
    const pageDocs = hasNext ? docs.slice(0, ART_PAGE_SIZE) : docs;
    const totalArts = matchedDocs.length;

    return {
      arts: pageDocs.map((doc) => this.conformItemGet(this.conformData(doc.data()) as Art)),
      totalArts,
      totalPages: Math.max(1, Math.ceil(totalArts / ART_PAGE_SIZE)),
      nextCursor: hasNext ? this.serializeCursor(pageDocs[pageDocs.length - 1]!) : null,
    };
  }

  private applyPreviewSorting(query: FirebaseFirestore.Query): FirebaseFirestore.Query {
    return query
      .orderBy('createdAt', 'desc')
      .orderBy(FieldPath.documentId(), 'desc');
  }

  private matchesPreviewFilters(
    doc: FirebaseFirestore.QueryDocumentSnapshot,
    filters: ArtPageFilters,
  ): boolean {
    if (filters.type !== 'all' && doc.get('type') !== filters.type) {
      return false;
    }

    if (filters.generation === 'ai' && doc.get('aIGenerated') !== true) {
      return false;
    }
    if (filters.generation === 'original' && doc.get('aIGenerated') === true) {
      return false;
    }

    return true;
  }

  private applyPreviewCursor(
    query: FirebaseFirestore.Query,
    cursor: string | null,
  ): FirebaseFirestore.Query {
    if (!cursor) {
      return query;
    }

    const { createdAt, docId } = this.parseCursor(cursor);
    return query.startAfter(Timestamp.fromDate(createdAt), docId);
  }

  private parseCursor(cursor: string): { createdAt: Date; docId: string } {
    const [createdAtValue, ...docIdParts] = cursor.split('::');
    const docId = docIdParts.join('::').trim();
    const createdAt = new Date(createdAtValue ?? '');

    if (!docId) {
      throw new Error(`Invalid art cursor: ${cursor}`);
    }

    if (Number.isNaN(createdAt.getTime())) {
      throw new Error(`Invalid art cursor timestamp: ${cursor}`);
    }

    return { createdAt, docId };
  }

  private serializeCursor(doc: FirebaseFirestore.QueryDocumentSnapshot): string {
    const createdAt = doc.get('createdAt');
    const timestamp = createdAt instanceof Timestamp
      ? createdAt.toDate().toISOString()
      : createdAt instanceof Date
        ? createdAt.toISOString()
        : new Date(createdAt).toISOString();

    return `${timestamp}::${doc.id}`;
  }
}

function chunkValues<T>(values: T[], size = 30): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function compareArtDocs(
  left: FirebaseFirestore.QueryDocumentSnapshot,
  right: FirebaseFirestore.QueryDocumentSnapshot,
): number {
  const leftCreatedAt = getDocDate(left.get('createdAt')).getTime();
  const rightCreatedAt = getDocDate(right.get('createdAt')).getTime();

  if (leftCreatedAt !== rightCreatedAt) {
    return rightCreatedAt - leftCreatedAt;
  }

  return right.id.localeCompare(left.id);
}

function getDocDate(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date(value as string);
}

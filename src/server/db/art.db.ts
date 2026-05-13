import 'server-only';
import { Art, generateArtId, getArtId } from '@/entities/Art';
import { RootDB } from './root.db';
import {
  ART_PAGE_SIZE,
  ArtListGenerationFilter,
  ArtListTypeFilter,
  normalizeArtSearchText,
  parseArtSearchQuery,
} from '@/lib/artList';
import { buildSearchPrefixes } from '@/lib/searchQueryFields';
import { FieldPath, Timestamp } from 'firebase-admin/firestore';

type ArtPageFilters = {
  query: string;
  artistId: string;
  type: ArtListTypeFilter;
  generation: ArtListGenerationFilter;
  page: number;
};

type ArtPage = {
  arts: Art[];
  totalArts: number;
  totalPages: number;
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
    const artistIds = [...new Set([
      ...search.artistIds,
      ...artistNameSearchIds,
      ...(filters.artistId ? [filters.artistId] : []),
    ])];

    if (search.idOnly || search.artIds.length > 0 || artistIds.length > 0 || search.normalizedText) {
      return this.getPreviewPageWithExpandedSearch(filters, {
        ...search,
        artistIds,
      });
    }

    const countQuery = this.applyPreviewFilters(filters);
    const pageQuery = this
      .applyPreviewSorting(this.applyPreviewFilters(filters))
      .offset(getPageOffset(filters.page))
      .limit(ART_PAGE_SIZE);

    const [countSnapshot, querySnapshot] = await Promise.all([
      countQuery.count().get(),
      pageQuery.get(),
    ]);
    const totalArts = Number(countSnapshot.data().count);

    return {
      arts: querySnapshot.docs.map((doc) => this.conformItemGet(this.conformData(doc.data()) as Art)),
      totalArts,
      totalPages: Math.max(1, Math.ceil(totalArts / ART_PAGE_SIZE)),
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

    if (filters.artistId) {
      query = query.where('artistId', '==', filters.artistId);
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
      queryPromises.push(collection.get());
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
      .filter((doc) => this.matchesExpandedSearch(doc, search))
      .filter((doc) => this.matchesPreviewFilters(doc, filters))
      .sort(compareArtDocs);
    const pageDocs = matchedDocs.slice(getPageOffset(filters.page), getPageOffset(filters.page) + ART_PAGE_SIZE);
    const totalArts = matchedDocs.length;

    return {
      arts: pageDocs.map((doc) => this.conformItemGet(this.conformData(doc.data()) as Art)),
      totalArts,
      totalPages: Math.max(1, Math.ceil(totalArts / ART_PAGE_SIZE)),
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

    if (filters.artistId && doc.get('artistId') !== filters.artistId) {
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

  private matchesExpandedSearch(
    doc: FirebaseFirestore.QueryDocumentSnapshot,
    search: ReturnType<typeof parseArtSearchQuery>,
  ): boolean {
    const artId = String(doc.get('id') ?? doc.id).toLowerCase();
    const artistId = String(doc.get('artistId') ?? '').toLowerCase();
    const title = normalizeArtSearchText(String(doc.get('title') ?? ''));

    return search.artIds.includes(artId)
      || search.artistIds.includes(artistId)
      || (!search.idOnly && !!search.normalizedText && title.includes(search.normalizedText));
  }
}

function getPageOffset(page: number): number {
  return Math.max(0, page - 1) * ART_PAGE_SIZE;
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

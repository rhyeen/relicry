import 'server-only';
import { RootDB } from './root.db';
import { Artist, generateArtistId, getArtistId } from '@/entities/Artist';
import { buildSearchPrefixes } from '@/lib/searchQueryFields';

export class ArtistDB extends RootDB<Artist> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'artists');
  }

  protected prefixId(id: string): string {
    return getArtistId(id);
  }

  public getFromParts(id: string): Promise<Artist | null> {
    return this.get(id);
  }

  protected getUnsafeDocId(item: Artist): string {
    return item.id
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected conformItemSet(item: Artist): any {
    return {
      ...item,
      queryNamePrefixes: buildSearchPrefixes(item.name),
    };
  }

  public async getIdsByNamePrefix(normalizedNameQuery: string): Promise<string[]> {
    if (!normalizedNameQuery) {
      return [];
    }

    const querySnapshot = await this.firestoreAdmin
      .collection(this.collectionName)
      .where('queryNamePrefixes', 'array-contains', normalizedNameQuery)
      .get();

    return querySnapshot.docs
      .map((doc) => this.conformItemGet(this.conformData(doc.data()) as Artist).id)
      .filter(Boolean);
  }

  public async generateId(): Promise<string> {
    return this.getUniqueId(generateArtistId);
  }
}

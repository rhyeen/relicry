import 'server-only';

import { Art, getArtId } from '@/entities/Art';
import { ART_PAGE_SIZE, ArtListFilters, getArtPageNumber, parseArtSearchQuery } from '@/lib/artList';
import { ArtPreviewListItem, ArtPreviewResponse } from '@/lib/artApi';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { getArtist } from '@/server/cache/artist.cache';
import { ArtDB } from '@/server/db/art.db';
import { ArtistDB } from '@/server/db/artist.db';

export async function getArtPreviewPage(filters: ArtListFilters): Promise<ArtPreviewResponse> {
  const search = parseArtSearchQuery(filters.query);
  const artistNameSearchIds = !search.idOnly && search.normalizedText
    ? await new ArtistDB(getFirestoreAdmin()).getIdsByNamePrefix(search.normalizedText)
    : [];
  const result = await new ArtDB(getFirestoreAdmin()).getPreviewPage(filters, artistNameSearchIds);
  const items = await buildArtPreviewItems(result.arts);

  return {
    items,
    page: getArtPageNumber(filters),
    totalPages: result.totalPages,
    totalArts: result.totalArts,
    pageSize: ART_PAGE_SIZE,
    nextCursor: result.nextCursor,
  };
}

export async function buildArtPreviewItems(arts: Art[]): Promise<ArtPreviewListItem[]> {
  const artistIds = [...new Set(arts.map((art) => art.artistId).filter(Boolean))];
  const artistEntries = await Promise.all(
    artistIds.map(async (artistId) => [artistId, (await getArtist(artistId))?.name ?? null] as const),
  );
  const artistsById = new Map(artistEntries);

  return arts.map((art) => ({
    art,
    href: `/${getArtId(art.id)}`,
    artistName: artistsById.get(art.artistId) ?? null,
  }));
}

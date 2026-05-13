import { connection, NextRequest } from 'next/server';
import { parseArtFilters } from '@/lib/artList';
import { getArtPreviewPage } from '@/server/artPreview';
import { handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

function parseSearchParams(searchParams: URLSearchParams) {
  return parseArtFilters({
    query: searchParams.get('query') ?? undefined,
    artistId: searchParams.get('artistId') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    generation: searchParams.get('generation') ?? undefined,
    page: searchParams.get('page') ?? undefined,
  });
}

export async function GET(req: NextRequest) {
  await connection();

  try {
    return handleJsonResponse(await getArtPreviewPage(parseSearchParams(req.nextUrl.searchParams)));
  } catch (e) {
    return handleRouteError(e);
  }
}

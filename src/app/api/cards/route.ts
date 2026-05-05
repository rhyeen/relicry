import { connection, NextRequest } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { CARDS_PAGE_SIZE, parseCardsFilters, getCardsPageNumber } from '@/lib/cardsList';
import { toCardMetadata } from '@/lib/cardMetadata';
import { CardDB } from '@/server/db/card.db';
import { handleJsonResponse, handleRouteError } from '@/server/routeHelpers';
import { getCardsPreviewPage } from '@/server/cardsPreview';

function parseSearchParams(searchParams: URLSearchParams) {
  return parseCardsFilters({
    query: searchParams.get('query') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    aspect: searchParams.get('aspect') ?? undefined,
    cursor: searchParams.get('cursor') ?? undefined,
    history: searchParams.get('history') ?? undefined,
  });
}

function parseView(searchParams: URLSearchParams): 'metadata' | 'preview' {
  return searchParams.get('view') === 'preview' ? 'preview' : 'metadata';
}

export async function GET(req: NextRequest) {
  await connection();

  try {
    const filters = parseSearchParams(req.nextUrl.searchParams);
    const view = parseView(req.nextUrl.searchParams);

    if (view === 'preview') {
      return handleJsonResponse(await getCardsPreviewPage(filters));
    }

    const result = await new CardDB(getFirestoreAdmin()).getFeaturedPage(filters);

    return handleJsonResponse({
      cards: result.cards.map(toCardMetadata),
      page: getCardsPageNumber(filters),
      totalPages: result.totalPages,
      totalCards: result.totalCards,
      pageSize: CARDS_PAGE_SIZE,
      nextCursor: result.nextCursor,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

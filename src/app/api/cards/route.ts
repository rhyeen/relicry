import { connection, NextRequest } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { CARDS_PAGE_SIZE, filterAndPaginateCards, parseCardsFilters } from '@/lib/cardsList';
import { toCardMetadata } from '@/lib/cardMetadata';
import { CardDB } from '@/server/db/card.db';
import { handleJsonResponse, handleRouteError } from '@/server/routeHelpers';

function parseSearchParams(searchParams: URLSearchParams) {
  return parseCardsFilters({
    page: searchParams.get('page') ?? undefined,
    query: searchParams.get('query') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    aspect: searchParams.get('aspect') ?? undefined,
  });
}

export async function GET(req: NextRequest) {
  await connection();

  try {
    const filters = parseSearchParams(req.nextUrl.searchParams);
    const { entities } = await new CardDB(getFirestoreAdmin()).getAllFeatured(0);
    const result = filterAndPaginateCards(entities, filters);

    return handleJsonResponse({
      cards: result.cards.map(toCardMetadata),
      page: result.page,
      totalPages: result.totalPages,
      totalCards: result.totalCards,
      pageSize: CARDS_PAGE_SIZE,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

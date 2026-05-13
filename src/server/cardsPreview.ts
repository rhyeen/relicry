import 'server-only';

import { getArt } from '@/server/cache/art.cache';
import { CardListFilters, CARDS_PAGE_SIZE, getCardsPageNumber } from '@/lib/cardsList';
import { CardDB } from '@/server/db/card.db';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { getCardDocId, VersionedCard, VersionedDeckCard, VersionedFocusCard } from '@/entities/Card';
import { Art } from '@/entities/Art';
import { ImageSize, ImageStorage } from '@/entities/Image';
import { CardPreviewListItem, CardsPreviewResponse } from '@/lib/cardsApi';

export async function getCardsPreviewPage(filters: CardListFilters): Promise<CardsPreviewResponse> {
  const result = await new CardDB(getFirestoreAdmin()).getFeaturedPage(filters);
  const items = await buildCardPreviewItems(result.cards);

  return {
    items,
    page: getCardsPageNumber(filters),
    totalPages: result.totalPages,
    totalCards: result.totalCards,
    pageSize: CARDS_PAGE_SIZE,
    nextCursor: result.nextCursor,
  };
}

export async function buildCardPreviewItems(cards: VersionedCard[]): Promise<CardPreviewListItem[]> {
  return Promise.all(
    cards.map(async (card) => {
      const art = card.illustration?.artId ? await getArt(card.illustration.artId) : null;
      return buildCardPreviewItem(card, art);
    })
  );
}

export function buildCardPreviewItem(card: VersionedCard, art: Art | null): CardPreviewListItem {
  const drawLimit = card.type === 'deck' ? (card as VersionedDeckCard).drawLimit : undefined;
  const scrapCost = card.type === 'deck' ? (card as VersionedDeckCard).scrapCost : undefined;
  const aspect = card.type === 'gambit'
    ? undefined
    : (card as VersionedDeckCard | VersionedFocusCard).aspect;

  return {
    card: {
      id: card.id,
      version: card.version,
      title: card.title,
      subTitle: card.subTitle,
      rarity: card.rarity,
      type: card.type,
      drawLimit,
      aspect,
      scrapCost,
    },
    href: `/${getCardDocId(card.id, card.version)}`,
    previewImage: getCardPreviewImage(art),
  };
}

export function getCardPreviewImage(art: Art | null): ImageStorage | null {
  if (!art || art.type !== 'illustration') {
    return null;
  }

  return (
    art.image?.[ImageSize.CardPreview]
    || art.image?.[ImageSize.Card]
    || art.image?.[ImageSize.CardFull]
    || null
  );
}

import type { PlayerCardDTO } from '@/entities/PlayerCard';
import type { CardPreviewListItem, CardsBaseResponse } from '@/lib/cardsApi';

export type PlayerCardCollectionItem = {
  playerCard: PlayerCardDTO | null;
  preview: CardPreviewListItem;
};

export type PlayerCardStatusResponse = {
  playerCard: PlayerCardDTO | null;
};

export type PlayerCardListResponse = CardsBaseResponse & {
  playerCards: PlayerCardDTO[];
  items: PlayerCardCollectionItem[];
};

export type PlayerCardMutationResponse = {
  playerCard: PlayerCardDTO;
};

import type { PlayerCardDTO } from '@/entities/PlayerCard';
import type { CardPreviewListItem } from '@/lib/cardsApi';

export type PlayerCardCollectionItem = {
  playerCard: PlayerCardDTO;
  preview: CardPreviewListItem | null;
};

export type PlayerCardStatusResponse = {
  playerCard: PlayerCardDTO | null;
};

export type PlayerCardListResponse = {
  playerCards: PlayerCardDTO[];
  items: PlayerCardCollectionItem[];
};

export type PlayerCardMutationResponse = {
  playerCard: PlayerCardDTO;
};

import { PlayerCard, PlayerCardCondition, PlayerCardLanguage, PlayerCardOwnership } from '@/entities/PlayerCard';
import { eventTestIds } from './event.data';
import { userTestIds } from './user.data';
import { cardTestIds } from './card.data';

function defaultPlayerCard(
  userId: string,
  cardId: string,
  condition: PlayerCardCondition,
  ownership: PlayerCardOwnership,
): PlayerCard {
  return {
    userId,
    cardId,
    cardVersion: 1,
    individuals: [
      {
        condition,
        language: PlayerCardLanguage.English,
        graded: null,
        signedByIllustrator: false,
        signedByAuthor: false,
        notes: '',
        acquiredAt: new Date(),
        acquiredFrom: eventTestIds.event1,
        foiled: false,
        ownership,
      },
    ],
    updatedAt: new Date(),
  };
}

export function getExamplePlayerCard1(): PlayerCard {
  return defaultPlayerCard(
    userTestIds.user1,
    cardTestIds.deckCard1,
    PlayerCardCondition.NearMint,
    PlayerCardOwnership.Owned,
  );
}

export function getExamplePlayerCard2(): PlayerCard {
  return defaultPlayerCard(
    userTestIds.user2,
    cardTestIds.deckCard2,
    PlayerCardCondition.LightPlayed,
    PlayerCardOwnership.LookingToSell,
  );
}

export function getExamplePlayerCard3(): PlayerCard {
  return defaultPlayerCard(
    userTestIds.user3,
    cardTestIds.focusCard3,
    PlayerCardCondition.Mint,
    PlayerCardOwnership.WishList,
  );
}

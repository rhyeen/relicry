import { prefixId, StoredRoot } from './Root';
import type { SerializeDates } from '@/lib/serialization';

export type PlayerCard = StoredRoot & {
  userId: string;
  cardId: string;
  cardVersion: number;
  individuals: {
    condition: PlayerCardCondition;
    language: PlayerCardLanguage;
    graded: {
      company: GradingCompany;
      grade: number;
      gradeId: GradeID;
    } | null;
    signedByIllustrator: boolean;
    signedByAuthor: boolean;
    notes: string;
    acquiredAt: Date;
    acquiredFrom: string;
    foiled: boolean;
    ownership: PlayerCardOwnership;
  }[];
  updatedAt: Date;
}

export type PlayerCardDTO = SerializeDates<PlayerCard>;

export enum PlayerCardCondition {
  Mint = 'MT',
  NearMint = 'NM',
  Good = 'GD',
  LightPlayed = 'LP',
  HeavilyPlayed = 'HP',
  Damaged = 'DG',
}

export enum PlayerCardOwnership {
  Owned = 'OWN',
  LookingToSell = 'LTS',
  LookingToBuy = 'LTB',
  WishList = 'WL',
}

export enum PlayerCardLanguage {
  English = 'EN',
}

export enum GradingCompany {
  PSA = 'PSA',
  BGS = 'BGS',
  SGC = 'SGC',
}

export enum GradeID {
  PSAGEMMT = 'PSA-10 GEM MT',
}

export function getPlayerCardId(userId: string, cardId: string, cardVersion: number): string {
  return prefixId('pc', `${userId}/${cardId}/${cardVersion}`);
}

import { CardEffect } from './CardEffect';
import { FlavorText } from './FlavorText';

export interface Apex {
  id: string;
  type: 'revealed' | 'hidden';
  season: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  health: number | {
    // @NOTE: These are only used for type === 'hidden'
    from: number;
    to: number;
  };
  illustration: {
    artId: string;
    artistId: string;
  };
  flavorText?: FlavorText;
  effects: CardEffect[];
}

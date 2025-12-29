import { Faction } from './Faction';
import { LocaleMap } from './LocaleMap';

export interface VersionedQuest extends Quest, Version {}

export interface Version {
  season: number;
  archived?: {
    at: Date;
    context: LocaleMap;
  };
  revealed: {
    at: Date;
    context: LocaleMap;
  };
  published?: {
    at: Date;
    context: LocaleMap;
  };
}

export interface Quest {
  id: string;
  faction: Faction;
  level: number;
}

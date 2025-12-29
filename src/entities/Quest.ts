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
  // q/a1b
  id: string;
  faction: Faction;
  level: number;
}

export interface QuestToken {
  // t[1-9]/${questId, excluding the 'q/' prefix}
  id: string;
  questId: string;
  version: number;
  // e.g. "Broken Sword"
  token: LocaleMap;
}

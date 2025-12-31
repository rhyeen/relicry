import { Faction } from './Faction';
import { StoredRoot } from './Root';

export interface VersionedQuest extends Quest, Version, StoredRoot {}

export interface Version {
  season: number;
  archived?: {
    at: Date;
    context?: string;
  };
  revealed: {
    at: Date;
    context?: string;
  };
  published?: {
    at: Date;
    context?: string;
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
  token: string;
}

export function getQuestDocId(id: string, season: number): string {
  return `${id}/${season}`;
}

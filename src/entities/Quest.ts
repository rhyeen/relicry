import { Faction } from './Faction';
import { prefixId, StoredRoot } from './Root';

export type VersionedQuest = Quest & Version & StoredRoot;

export type Version = {
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

export type Quest = {
  // q/a1b
  id: string;
  faction: Faction;
  level: number;
}

export type QuestToken = {
  // t[1-9]/${questId, excluding the 'q/' prefix}
  id: string;
  questId: string;
  version: number;
  // e.g. "Broken Sword"
  token: string;
}

export function getQuestId(id: string): string {
  return prefixId('q', id);
}

export function getQuestDocId(id: string, season: number): string {
  return `${getQuestId(id)}/${season}`;
}

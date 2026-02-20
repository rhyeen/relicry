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
  faction: Faction;
  // q/a1b/0
  questId: string;
  season: number;
}

export function getQuestId(id: string): string {
  return prefixId('q', id);
}

export function getQuestDocId(id: string, season: number): string {
  return `${getQuestId(id)}/${season}`;
}

export function getTokenId(id: string): string{ 
  return prefixId('t', id);
}

export function getQuestTokenId(questTokenId: string, questId?: string): string {
  return getTokenId(`${questTokenId}${questId ? `/${questId.replace('q/', '')}` : ''}`);
}

export function getQuestTokenDocId(questTokenId: string, questId: string, season: number): string {
  return `${getQuestTokenId(questTokenId, questId)}/${season}`;
}

export function extractTokenRawId(questTokenId: string): string {
  return questTokenId.split('/')[1];
}

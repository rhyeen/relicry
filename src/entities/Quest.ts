import { Faction } from './Faction';
import { generateId } from '@/lib/idGenerator';
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

export function generateQuestId(): string {
  return getQuestId(generateId(3));
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

export const definedRawQuestTokenIdsEn: Record<string, string> = {
  '1': 'Broken Sword',
  '2': 'Strange Fruit',
  '3': 'Brass Bell',
  '4': 'Secret Note',
  '5': 'Cursed Idol',
  '6': 'Forgotten Map',
  '7': 'Lockless Key',
  '8': 'Glowing Gem',
  '9': 'Torn Cloak',
  '10': 'Dying Candle',
  '11': 'Ethereal Feather',
  '12': 'Haunted Doll',
};

export const definedQuestTokenIds = Object.keys(definedRawQuestTokenIdsEn).map(id => getTokenId(id));

export const defaultQuestTokenIdFactions: Record<string, Faction> = {
  '1': Faction.IronbandGuild,
  '2': Faction.NightglassCo,
  '3': Faction.BridlewildKin,
  '4': Faction.NightglassCo,
  '5': Faction.OrdoAether,
  '6': Faction.IronbandGuild,
  '7': Faction.NightglassCo,
  '8': Faction.OrdoAether,
  '9': Faction.BridlewildKin,
  '10': Faction.OrdoAether,
  '11': Faction.BridlewildKin,
  '12': Faction.IronbandGuild,
};

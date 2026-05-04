import { generateId } from '@/lib/idGenerator';
import { prefixId, StoredRoot } from './Root';
import { getEventId } from './Event';

export type UniqueReward = StoredRoot & {
  id: string;
  level: number;
  eventId: string;
  claimed?: {
    at: Date;
    heraldId: string;
  };
  published?: {
    at: Date;
    context?: string;
  };
  archived?: {
    at: Date;
    context?: string;
  };
}

export type Reward = StoredRoot & {
  eventId: string;
  level: number;
  // Either the reward is tied to a specific quest or scene
  questId: string | null;
  sceneId: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  // @NOTE: See RewardOption for more details
}

export function getRewardId(eventId: string, level: number): string {
  return `${getEventId(eventId)}/r/${level}`;
}

export function getUniqueRewardId(id: string): string {
  return prefixId('ur', id);
}

export function getUniqueRewardDocId(id: string): string {
  return getUniqueRewardId(id);
}

export function generateUniqueRewardId(level: number): string {
  return getUniqueRewardId(level + generateId(17));
}

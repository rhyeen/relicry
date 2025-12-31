import { StoredRoot } from './Root';

export interface Reward extends StoredRoot {
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
  return `${eventId}/r/${level}`;
}

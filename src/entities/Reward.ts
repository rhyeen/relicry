export interface Reward {
  // Id is `${eventId}/r${level}`
  id: string;
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

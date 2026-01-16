import { prefixId, StoredRoot } from './Root';

export type TrackEventQuest = StoredRoot & {
  eventId: string;
  questId: string;
  // of the player
  userId: string;
  givenAt: Date;
  // If a player loses a quest card, they can be reissued the quest, but
  // this will track how many times it has been reissued to flag potential abuse
  graces: number;
  playerTracked: {
    completedAt: Date | null;
    // Track per-thread completion for the player
    threads: {
      threadId: string;
      completedAt: Date | null;
    }[];
    defeatedApex: boolean;
    deckVersion: string | null;
  }
}

export function getTrackEventQuestId(userId: string, eventId: string, questId: string): string {
  return prefixId('teq', `${userId}/${eventId}/${questId}`);
}

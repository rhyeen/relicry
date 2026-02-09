import { prefixId, StoredRoot } from './Root';

export type EventQuest = StoredRoot & {
  eventId: string;
  questId: string;
  apexId: string;
  rewardId: string;
  title: string;
  threads: QuestThread[];
  questClaimed: {
    from: Date;
    to: Date;
  };
  description: {
    // This text starts off the quest with context for the threads
    start: string;
    // If all threads are completed for the player, show this text
    end: string;
  };
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export type QuestThread = {
  title: string;
  objective: string;
  imageId?: string;
  // If this quest is a scene, what scene does it relate to
  sceneId?: string;
  // The vendor to whom this quest thread is associated
  heraldId: string;
  // The quest token ID rewarded upon completion of this thread
  tokenId: string;
  description: {
    // This text starts off the thread with context for the objective
    start: string;
    // This text is shown upon completing the thread
    end: string;
  };
}

export function getEventQuestId(eventId: string, questId: string): string {
  return prefixId('eq', `${eventId}/${questId}`);
}
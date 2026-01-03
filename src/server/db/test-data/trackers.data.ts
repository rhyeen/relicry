import { TrackEventQuest } from '@/entities/Trackers';
import { eventTestIds } from './event.data';
import { questTestIds } from './quest.data';
import { userTestIds } from './user.data';

function defaultTrackEventQuest(
  eventId: string,
  questId: string,
  userId: string,
): TrackEventQuest {
  return {
    eventId,
    questId,
    userId,
    givenAt: new Date(),
    graces: 0,
    playerTracked: {
      completedAt: null,
      threads: [],
      defeatedApex: false,
      deckVersion: null,
    },
  };
}

export function getExampleTrackEventQuest1(): TrackEventQuest {
  return defaultTrackEventQuest(
    eventTestIds.event1,
    questTestIds.quest1,
    userTestIds.user1,
  );
}

export function getExampleTrackEventQuest2(): TrackEventQuest {
  return defaultTrackEventQuest(
    eventTestIds.event1,
    questTestIds.quest2,
    userTestIds.user2,
  );
}

export function getExampleTrackEventQuest3(): TrackEventQuest {
  return defaultTrackEventQuest(
    eventTestIds.event2,
    questTestIds.quest3,
    userTestIds.user3,
  );
}
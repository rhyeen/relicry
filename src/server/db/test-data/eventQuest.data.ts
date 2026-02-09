import { EventQuest } from '@/entities/EventQuest';
import { eventTestIds, getExampleEvent1, getExampleEvent2 } from './event.data';
import { questTestIds } from './quest.data';
import { apexTestIds } from './apex.data';
import { rewardTestIds } from './reward.data';

function defaultEventQuest(
  eventId: string,
  questId: string,
  apexId: string,
  rewardId: string,
  title: string,
  questClaimedFrom: Date,
  questClaimedTo: Date,
): EventQuest {
  return {
    eventId,
    questId,
    apexId,
    rewardId,
    title,
    threads: [],
    questClaimed: {
      from: questClaimedFrom,
      to: questClaimedTo,
    },
    description: {
      start: 'Start of the quest.',
      end: 'End of the quest.',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
  };
}

export function getExampleEventQuest1(): EventQuest {
  return defaultEventQuest(
    eventTestIds.event1,
    questTestIds.quest1,
    apexTestIds.apex1,
    rewardTestIds.reward1,
    'Event Quest 1',
    getExampleEvent1().running.from,
    getExampleEvent1().running.to,
  );
}

export function getExampleEventQuest2(): EventQuest {
  return defaultEventQuest(
    eventTestIds.event1,
    questTestIds.quest2,
    apexTestIds.apex2,
    rewardTestIds.reward2,
    'Event Quest 2',
    getExampleEvent1().running.from,
    getExampleEvent1().running.to,
  );
}

export function getExampleEventQuest3(): EventQuest {
  return defaultEventQuest(
    eventTestIds.event2,
    questTestIds.quest3,
    apexTestIds.apex3,
    rewardTestIds.reward3,
    'Event Quest 3',
    getExampleEvent2().running.from,
    getExampleEvent2().running.to,
  );
}
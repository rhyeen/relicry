import { getRewardId } from '@/entities/Reward';
import { eventTestIds } from './event.data';

export const rewardTestIds = {
  reward1: eventTestIds.event1 + '/r/1',
  reward2: eventTestIds.event1 + '/r/2',
  reward3: eventTestIds.event2 + '/r/1',
};

function defaultReward(eventId: string, level: number) {
  return {
    id: getRewardId(eventId, level),
    eventId,
    level,
    questId: null,
    sceneId: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    archivedAt: null,
  };
}

export function getExampleReward1() {
  return defaultReward(eventTestIds.event1, 1);
}

export function getExampleReward2() {
  return defaultReward(eventTestIds.event1, 2);
}

export function getExampleReward3() {
  return defaultReward(eventTestIds.event1, 3);
}

export function getExampleReward4() {
  return defaultReward(eventTestIds.event2, 1);
}
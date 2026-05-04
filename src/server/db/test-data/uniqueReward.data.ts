import { UniqueReward, getUniqueRewardId } from '@/entities/Reward';
import { eventTestIds } from './event.data';

export const uniqueRewardTestIds = {
  reward1a: getUniqueRewardId('1sample00000000001'),
  reward1b: getUniqueRewardId('1sample00000000002'),
  reward2a: getUniqueRewardId('2sample00000000001'),
};

function defaultUniqueReward(id: string, eventId: string, level: number): UniqueReward {
  return {
    id,
    eventId,
    level,
  };
}

export function getExampleUniqueReward1(): UniqueReward {
  return {
    ...defaultUniqueReward(uniqueRewardTestIds.reward1a, eventTestIds.event1, 1),
    published: { at: new Date('2025-01-01T00:00:00Z') },
  };
}

export function getExampleUniqueReward2(): UniqueReward {
  return defaultUniqueReward(uniqueRewardTestIds.reward1b, eventTestIds.event1, 1);
}

export function getExampleUniqueReward3(): UniqueReward {
  return {
    ...defaultUniqueReward(uniqueRewardTestIds.reward2a, eventTestIds.event1, 2),
    archived: { at: new Date('2025-01-15T00:00:00Z') },
  };
}

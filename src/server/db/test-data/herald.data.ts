import { Herald } from '@/entities/Herald';
import { userTestIds } from './user.data';
import { eventTestIds } from './event.data';
import { eventMapTestIds } from './eventMap.data';

export const heraldTestIds = {
  herald1: 'hrd/1111111111',
  herald2: 'hrd/1111111112',
  herald3: 'hrd/1111111113',
}

function defaultHerald(id: string, userId: string, eventId: string, mapId: string): Herald {
  return {
    id,
    userId,
    artistId: null,
    eventId,
    override: {},
    mapPin: {
      id: mapId,
      x: 0,
      y: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
  };
}

export function getExampleHerald1() {
  return {
    ...defaultHerald(
      heraldTestIds.herald1,
      userTestIds.user1,
      eventTestIds.event1,
      eventMapTestIds.eventMap1,
    ),
  };
}

export function getExampleHerald2() {
  return {
    ...defaultHerald(
      heraldTestIds.herald2,
      userTestIds.user2,
      eventTestIds.event2,
      eventMapTestIds.eventMap2,
    ),
  };
}

export function getExampleHerald3() {
  return {
    ...defaultHerald(
      heraldTestIds.herald3,
      userTestIds.user3,
      eventTestIds.event3,
      eventMapTestIds.eventMap3,
    ),
  };
}
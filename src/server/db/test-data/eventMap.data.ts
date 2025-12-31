import { EventMap } from '@/entities/EventMap';
import { eventTestIds } from './event.data';

export const eventMapTestIds = {
  eventMap1: 'map/1111111111',
  eventMap2: 'map/1111111112',
  eventMap3: 'map/1111111113',
};

function defaultEventMap(eventId: string, id: string): EventMap {
  return {
    eventId,
    id,
    imageUrl: 'https://fastly.picsum.photos/id/966/3000/2000.jpg?hmac=SULeTH8M0X8yHP3uQw-NbLdUOz35wavh6fVUB26b7Cg',
    imageWidthPx: 3000,
    imageHeightPx: 2000,
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
  };
}

export function getExampleEventMap1(): EventMap {
  return defaultEventMap(
    eventTestIds.event1,
    eventMapTestIds.eventMap1,
  );
}

export function getExampleEventMap2(): EventMap {
  return defaultEventMap(
    eventTestIds.event2,
    eventMapTestIds.eventMap2,
  );
}

export function getExampleEventMap3(): EventMap {
  return defaultEventMap(
    eventTestIds.event3,
    eventMapTestIds.eventMap3,
  );
}

import { Event } from '@/entities/Event';

export const eventTestIds = {
  event1: 'e/custom1',
  event2: 'e/custom2',
  event3: 'e/custom3',
};

function defaultEvent(id: string, title: string, description: string, from: Date, to: Date): Event {
  return {
    id,
    title,
    description,
    running: {
      from,
      to,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
  };
}

export function getExampleEvent1(): Event {
  return defaultEvent(
    eventTestIds.event1,
    'Spring Festival',
    'Celebrate the arrival of spring with special events and rewards!',
    new Date(new Date().setDate(new Date().getDate() - 2)),
    new Date(new Date().setDate(new Date().getDate() + 5))
  );
}

export function getExampleEvent2(): Event {
  return defaultEvent(
    eventTestIds.event2,
    'Summer Splash',
    'Dive into summer fun with exclusive challenges and prizes!',
    new Date('2025-06-01T00:00:00Z'),
    new Date('2025-06-30T23:59:59Z')
  );
}

export function getExampleEvent3(): Event {
  return defaultEvent(
    eventTestIds.event3,
    'Autumn Harvest',
    'Join us in celebrating the bounties of autumn with exciting quests!',
    new Date(new Date().setDate(new Date().getDate() + 30)),
    new Date(new Date().setDate(new Date().getDate() + 31)),
  );
}
import { ActiveEvent, StarterObtained, User } from '@/entities/User';

export const ACTIVE_EVENT_DURATION_MS = 16 * 60 * 60 * 1000;

export type StarterFocusOption = {
  id: string;
  title: string;
};

export type StarterObtainedView = StarterObtained & {
  title: string;
};

export function normalizeStarterObtainedMap(
  value: unknown,
): Record<string, StarterObtained> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const starters: Record<string, StarterObtained> = {};
  for (const [key, rawRecord] of Object.entries(value)) {
    if (!rawRecord || typeof rawRecord !== 'object' || Array.isArray(rawRecord)) {
      continue;
    }
    const record = rawRecord as Partial<StarterObtained>;
    const id = typeof record.id === 'string' && record.id ? record.id : key;
    const obtainedAt = normalizeDate(record.obtainedAt);
    const obtainedBy = typeof record.obtainedBy === 'string' ? record.obtainedBy : '';
    const atEventId = typeof record.atEventId === 'string' ? record.atEventId : '';

    starters[id] = {
      id,
      obtainedAt,
      obtainedBy,
      atEventId,
    };
  }

  return starters;
}

export function normalizeActiveEvent(value: unknown): ActiveEvent | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const activeEvent = value as Partial<ActiveEvent>;
  if (typeof activeEvent.id !== 'string' || !activeEvent.id) {
    return null;
  }

  return {
    id: activeEvent.id,
    checkedInAt: normalizeDate(activeEvent.checkedInAt),
  };
}

export function normalizeStarterDeckFocusCardIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value
    .map((id) => typeof id === 'string' ? id.trim() : '')
    .filter(Boolean)
  )];
}

export function normalizeUserStarterFields<T extends Partial<User>>(user: T): T & {
  startersObtained: Record<string, StarterObtained>;
  activeEvent: ActiveEvent | null;
} {
  return {
    ...user,
    startersObtained: normalizeStarterObtainedMap(user.startersObtained),
    activeEvent: normalizeActiveEvent(user.activeEvent),
  };
}

export function isActiveEventCurrent(
  activeEvent: ActiveEvent | null | undefined,
  now = new Date(),
): activeEvent is ActiveEvent {
  if (!activeEvent) return false;
  const checkedInAt = normalizeDate(activeEvent.checkedInAt);
  return now.getTime() - checkedInAt.getTime() < ACTIVE_EVENT_DURATION_MS;
}

export function getStarterDeckHeading(count: number): string {
  return count === 1 ? 'Starter deck obtained' : 'Starter decks obtained';
}

function normalizeDate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (value && typeof value === 'object' && 'toDate' in value) {
    const maybeTimestamp = value as { toDate?: () => Date };
    const parsed = maybeTimestamp.toDate?.();
    if (parsed instanceof Date && !Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(0);
}

import 'server-only';
import { RootDB } from './root.db';
import { Event, generateEventId, getEventId } from '@/entities/Event';
import { normalizeStarterDeckFocusCardIds } from '@/lib/starterDecks';

export class EventDB extends RootDB<Event> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'events');
  }

  protected prefixId(id: string): string {
    return getEventId(id);
  }

  public getFromParts(id: string): Promise<Event | null> {
    return this.get(id);
  }

  protected getUnsafeDocId(item: Event): string {
    return item.id;
  }

  protected conformItemGet(item: Event): Event {
    return {
      ...item,
      starterDeckFocusCardIds: normalizeStarterDeckFocusCardIds(item.starterDeckFocusCardIds),
    };
  }

  protected conformItemSet(item: Event): Event {
    return {
      ...item,
      starterDeckFocusCardIds: normalizeStarterDeckFocusCardIds(item.starterDeckFocusCardIds),
    };
  }

  public async generateId(): Promise<string> {
    return this.getUniqueId(generateEventId);
  }
}

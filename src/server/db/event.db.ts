import 'server-only';
import { RootDB } from './root.db';
import { Event, getEventId } from '@/entities/Event';

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
}
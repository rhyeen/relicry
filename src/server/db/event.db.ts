import 'server-only';
import { RootDB } from './root.db';
import { Event } from '@/entities/Event';
import { conformId } from '@/lib/firestoreConform';

export class EventDB extends RootDB<Event> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'events');
  }

  public getFromParts(id: string): Promise<Event | null> {
    return this.get(id);
  }

  protected getDocId(item: Event): string {
    return conformId(item.id);
  }
}
import 'server-only';
import { RootDB } from './root.db';
import { EventMap } from '@/entities/EventMap';
import { conformId } from '@/lib/firestoreConform';

export class EventMapDB extends RootDB<EventMap> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'eventMaps');
  }

  public getFromParts(id: string): Promise<EventMap | null> {
    return this.get(id);
  }

  protected getDocId(item: EventMap): string {
    return conformId(item.id);
  }
}
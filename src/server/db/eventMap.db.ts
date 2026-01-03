import 'server-only';
import { RootDB } from './root.db';
import { EventMap, getEventMapId } from '@/entities/EventMap';

export class EventMapDB extends RootDB<EventMap> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'eventMaps');
  }

  protected prefixId(id: string): string {
    return getEventMapId(id);
  }

  public getFromParts(id: string): Promise<EventMap | null> {
    return this.get(id);
  }

  protected getUnsafeDocId(item: EventMap): string {
    return item.id;
  }
}
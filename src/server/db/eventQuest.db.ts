import 'server-only';
import { RootDB } from './root.db';
import { EventQuest, getEventQuestId } from '@/entities/EventQuest';
import { conformId } from '@/lib/firestoreConform';

export class EventQuestDB extends RootDB<EventQuest> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'eventQuests');
  }

  public getFromParts(eventId: string, questId: string): Promise<EventQuest | null> {
    return this.get(getEventQuestId(eventId, questId));
  }

  protected getDocId(item: EventQuest): string {
    return conformId(getEventQuestId(item.eventId, item.questId));
  }
}

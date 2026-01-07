import 'server-only';
import { RootDB } from './root.db';
import { EventQuest, getEventQuestId } from '@/entities/EventQuest';

export class EventQuestDB extends RootDB<EventQuest> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'eventQuests');
  }

  protected prefixId(id: string): string {
    // @NOTE: Always performed as getEventQuestId
    return id;
  }

  public getFromParts(eventId: string, questId: string): Promise<EventQuest | null> {
    return this.get(getEventQuestId(eventId, questId));
  }

  protected getUnsafeDocId(item: EventQuest): string {
    return getEventQuestId(item.eventId, item.questId);
  }
}

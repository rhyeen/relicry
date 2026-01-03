import 'server-only';
import { RootDB } from './root.db';
import { getTrackEventQuestId, TrackEventQuest } from '@/entities/Trackers';

export class TrackQuestEventDB extends RootDB<TrackEventQuest> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'trackQuestEvents');
  }

  protected prefixId(id: string): string {
    // No prefixing needed for composite IDs
    return id;
  }

  public getFromParts(userId: string, eventId: string, questId: string): Promise<TrackEventQuest | null> {
    return this.get(getTrackEventQuestId(userId, eventId, questId));
  }

  protected getUnsafeDocId(item: TrackEventQuest): string {
    return getTrackEventQuestId(item.userId, item.eventId, item.questId);
  }
}
import 'server-only';
import { RootDB } from './root.db';
import { getTrackEventQuestId, TrackEventQuest } from '@/entities/Trackers';
import { conformId } from '@/lib/firestoreConform';

export class TrackQuestEventDB extends RootDB<TrackEventQuest> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'trackQuestEvents');
  }

  public getFromParts(userId: string, eventId: string, questId: string): Promise<TrackEventQuest | null> {
    return this.get(getTrackEventQuestId(userId, eventId, questId));
  }

  protected getDocId(item: TrackEventQuest): string {
    return conformId(getTrackEventQuestId(item.userId, item.eventId, item.questId));
  }
}
import 'server-only';
import { Reward, getRewardId } from '@/entities/Reward';
import { RootDB } from './root.db';
import { getEventId } from '@/entities/Event';

export class RewardDB extends RootDB<Reward> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'rewards');
  }

  protected prefixId(id: string): string {
    return getEventId(id);
  }

  public getFromParts(eventId: string, level: number): Promise<Reward | null> {
    return this.get(getRewardId(eventId, level));
  }

  protected getUnsafeDocId(item: Reward): string {
    return getRewardId(item.eventId, item.level);
  }
}
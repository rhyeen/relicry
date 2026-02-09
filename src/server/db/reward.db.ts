import 'server-only';
import { Reward, getRewardId } from '@/entities/Reward';
import { RootDB } from './root.db';
import { getQuestId } from '@/entities/Quest';

export class RewardDB extends RootDB<Reward> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'rewards');
  }

  protected prefixId(id: string): string {
    return getQuestId(id);
  }

  public getFromParts(eventId: string, level: number): Promise<Reward | null> {
    return this.get(getRewardId(eventId, level));
  }

  protected getUnsafeDocId(item: Reward): string {
    return getRewardId(item.eventId, item.level);
  }
}
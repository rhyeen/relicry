import 'server-only';
import { Reward, getRewardId } from '@/entities/Reward';
import { RootDB } from './root.db';
import { conformId } from '@/lib/firestoreConform';

export class RewardDB extends RootDB<Reward> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'rewards');
  }

  public getFromParts(eventId: string, level: number): Promise<Reward | null> {
    return this.get(getRewardId(eventId, level));
  }

  protected getDocId(item: Reward): string {
    return conformId(getRewardId(item.eventId, item.level));
  }
}
import 'server-only';
import { getUserId, User } from '@/entities/User';
import { RootDB } from './root.db';

export class UserDB extends RootDB<User> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'users');
  }

  protected prefixId(id: string): string {
    return getUserId(id);
  }

  public getFromParts(id: string): Promise<User | null> {
    return this.get(id);
  }

  protected getUnsafeDocId(item: User): string {
    return item.id;
  }
}
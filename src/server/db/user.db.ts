import 'server-only';
import { User } from '@/entities/User';
import { RootDB } from './root.db';
import { conformId } from '@/lib/firestoreConform';

export class UserDB extends RootDB<User> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'users');
  }

  public getFromParts(id: string): Promise<User | null> {
    return this.get(id);
  }

  protected getDocId(item: User): string {
    return conformId(item.id);
  }
}
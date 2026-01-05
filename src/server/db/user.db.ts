import 'server-only';
import { generateUserId, getUserId, User } from '@/entities/User';
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

  public async getByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const entities = await this.getBy({
      where: [
        { field: 'firebaseUid', op: '==', value: firebaseUid },
      ],
      limit: 100,
    });
    // @NOTE: Data inconsistency check
    if (entities.length > 1) {
      console.error(`Data inconsistency: Multiple users with same firebaseUid ${firebaseUid}`);
      // Keep the most likely correct one, delete the rest.
      entities.sort((a, b) => {
        if (a.archivedAt && !b.archivedAt) return 1;
        if (!a.archivedAt && b.archivedAt) return -1;
        if (a.displayName && !b.displayName) return -1;
        if (!a.displayName && b.displayName) return 1;
        if (a.email && !b.email) return -1;
        if (!a.email && b.email) return 1;
        if (a.adminRoles.length > b.adminRoles.length) return -1;
        if (a.adminRoles.length < b.adminRoles.length) return 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
    }
    const [keep, ...remove] = entities;
    await this.batchDelete(remove.map(u => u.id));
    return keep;
  }

  public async generateId(): Promise<string> {
    return this.getUniqueId(generateUserId);
  }

  public async getFromParts(id: string): Promise<User | null> {
    return this.get(id);
  }

  protected getUnsafeDocId(item: User): string {
    return item.id;
  }
}
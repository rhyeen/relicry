import 'server-only';
import { getSceneId, Scene } from '@/entities/Scene';
import { RootDB } from './root.db';

export class SceneDB extends RootDB<Scene> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'scenes');
  }

  protected prefixId(id: string): string {
    return getSceneId(id);
  }

  public getFromParts(id: string): Promise<Scene | null> {
    return this.get(id);
  }

  protected getUnsafeDocId(item: Scene): string {
    return item.id;
  }
}
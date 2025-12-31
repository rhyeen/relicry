import 'server-only';
import { Scene } from '@/entities/Scene';
import { RootDB } from './root.db';
import { conformId } from '@/lib/firestoreConform';

export class SceneDB extends RootDB<Scene> {
  constructor(
    firestoreAdmin: FirebaseFirestore.Firestore,
  ) {
    super(firestoreAdmin, 'scenes');
  }

  public getFromParts(id: string): Promise<Scene | null> {
    return this.get(id);
  }

  protected getDocId(item: Scene): string {
    return conformId(item.id);
  }
}
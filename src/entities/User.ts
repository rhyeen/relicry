import { generateId } from '@/lib/idGenerator';
import { AdminRole } from './AdminRole';
import { ImageSize, ImageStorage } from './Image';
import { prefixId, StoredRoot } from './Root';

export type StarterObtained = {
  id: string;
  obtainedAt: Date;
  obtainedBy: string;
  atEventId: string;
};

export type ActiveEvent = {
  id: string;
  checkedInAt: Date;
};

export type User = StoredRoot & {
  // u/a1b2c3d4e5
  id: string;
  firebaseUid: string;
  displayName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  adminRoles: AdminRole[];
  startersObtained: Record<string, StarterObtained>;
  activeEvent: ActiveEvent | null;
  profileImage?: {
    [ImageSize.Banner]?: ImageStorage;
    [ImageSize.Thumb]?: ImageStorage;
  };
}

export function getUserId(id: string): string {
  return prefixId('u', id);
}

export function generateUserId(): string {
  return getUserId(generateId(10));
}

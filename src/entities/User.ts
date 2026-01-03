import { AdminRole } from './AdminRole';
import { ImageSize, ImageStorage } from './Image';
import { StoredRoot } from './Root';

export interface User extends StoredRoot {
  // u/a1b2c3d4e5
  id: string;
  firebaseUid: string;
  displayName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  adminRoles: AdminRole[];
  profileImage?: {
    [ImageSize.Banner]?: ImageStorage;
    [ImageSize.Thumb]?: ImageStorage;
  };
}

import { AdminRole } from './AdminRole';

export interface User {
  // u/a1b2c3d4e5
  id: string;
  firebaseUid: string;
  displayName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  adminRoles: AdminRole[];
  profileImageUrl?: string;
}

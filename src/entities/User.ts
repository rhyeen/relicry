import { AdminRole } from './AdminRole';

export interface User {
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

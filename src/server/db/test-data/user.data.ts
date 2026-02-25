import { AdminRole } from '@/entities/AdminRole';
import { User } from '@/entities/User';

export const userTestIds = {
  user1: 'u/0000000001',
  user2: 'u/0000000002',
  user3: 'u/0000000003',
}

function defaultUser(id: string, displayName: string, email: string) : User {
  return {
    id,
    firebaseUid: `test-firebase-${id}`,
    displayName,
    email,
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
    adminRoles: [],
  };
}

export function getExampleUser1(): User {
  return {
    ...defaultUser(
      userTestIds.user1,
      'Test User 1',
      'testuser1@example.com',
    ),
    adminRoles: [AdminRole.SuperAdmin],
  };
}

export function getExampleUser2(): User {
  return defaultUser(
    userTestIds.user2,
    'Test User 2',
    'testuser2@example.com',
  );
}

export function getExampleUser3(): User {
  return defaultUser(
    userTestIds.user3,
    'Test User 3',
    'testuser3@example.com',
  );
}
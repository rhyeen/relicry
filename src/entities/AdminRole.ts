export enum AdminRole {
  SuperAdmin = 'super',
  ContentAdmin = 'content',
  EventAdmin = 'event',
  SceneAdmin = 'scene',
}

export function spreadUserRoles(roles: AdminRole[]): AdminRole[] {
  const uniqueRoles = new Set<AdminRole>(roles);
  if (uniqueRoles.has(AdminRole.SuperAdmin)) {
    uniqueRoles.add(AdminRole.ContentAdmin);
  }
  if (uniqueRoles.has(AdminRole.ContentAdmin)) {
    uniqueRoles.add(AdminRole.EventAdmin);
  }
  if (uniqueRoles.has(AdminRole.EventAdmin)) {
    uniqueRoles.add(AdminRole.SceneAdmin);
  }
  return Array.from(uniqueRoles);
}

export function hasRole(userRoles: AdminRole[] | undefined, requiredRole: AdminRole): boolean {
  if (!userRoles) return false;
  const spreadRoles = spreadUserRoles(userRoles);
  return spreadRoles.includes(requiredRole);
}

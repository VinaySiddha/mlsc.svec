export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  EVENT_ADMIN: 'event_admin',
  COMMUNITY_MODERATOR: 'community_moderator',
  PANEL: 'panel',
  USER: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  event_admin: 'Event Admin',
  community_moderator: 'Community Moderator',
  panel: 'Interview Panel',
  user: 'User',
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  event_admin: 80,
  community_moderator: 60,
  panel: 30,
  user: 10,
};

export const PERMISSIONS = {
  MANAGE_USERS: [ROLES.SUPER_ADMIN] as readonly Role[],
  MANAGE_EVENTS: [ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN] as readonly Role[],
  MANAGE_COMMUNITY: [ROLES.SUPER_ADMIN, ROLES.COMMUNITY_MODERATOR] as readonly Role[],
  MANAGE_CONTENT: [ROLES.SUPER_ADMIN] as readonly Role[],
  CREATE_POST: [ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN, ROLES.COMMUNITY_MODERATOR, ROLES.USER] as readonly Role[],
  MODERATE_POST: [ROLES.SUPER_ADMIN, ROLES.COMMUNITY_MODERATOR] as readonly Role[],
} as const;

export function hasPermission(userRole: Role, allowedRoles: readonly Role[]): boolean {
  return allowedRoles.includes(userRole);
}

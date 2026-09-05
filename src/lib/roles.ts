export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EVENT_ADMIN: 'event_admin',
  COMMUNITY_MODERATOR: 'community_moderator',
  COMMON_PANEL: 'common_panel',
  PANEL: 'panel',
  VIEW_ONLY: 'view_only',
  USER: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  event_admin: 'Event Admin',
  community_moderator: 'Community Moderator',
  common_panel: 'Common Interview Panel (All Domains)',
  panel: 'Support Panel (Domain Specific)',
  view_only: 'View-Only Admin (Applications)',
  user: 'User',
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  admin: 90,
  event_admin: 80,
  community_moderator: 60,
  common_panel: 35,
  panel: 30,
  view_only: 20,
  user: 10,
};

export const PERMISSIONS = {
  MANAGE_USERS: [ROLES.SUPER_ADMIN] as readonly Role[],
  MANAGE_EVENTS: [ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN] as readonly Role[],
  MANAGE_COMMUNITY: [ROLES.SUPER_ADMIN, ROLES.COMMUNITY_MODERATOR] as readonly Role[],
  MANAGE_CONTENT: [ROLES.SUPER_ADMIN] as readonly Role[],
  CREATE_POST: [ROLES.SUPER_ADMIN, ROLES.EVENT_ADMIN, ROLES.COMMUNITY_MODERATOR, ROLES.USER] as readonly Role[],
  MODERATE_POST: [ROLES.SUPER_ADMIN, ROLES.COMMUNITY_MODERATOR] as readonly Role[],
  VIEW_APPLICATIONS: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COMMON_PANEL, ROLES.PANEL, ROLES.VIEW_ONLY] as readonly Role[],
} as const;

export function hasPermission(userRole: Role, allowedRoles: readonly Role[]): boolean {
  return allowedRoles.includes(userRole);
}

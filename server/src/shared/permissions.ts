import type { User } from '@elitequest/shared';

// Minimal identity needed for permission checks. Full User rows (from
// middleware) and PublicUser shapes (from helpers/tests) both satisfy it.
export type Actor = Pick<User, 'id' | 'role' | 'is_admin'>;

export function isLecturer(user: Actor): boolean {
  return user.role === 'lecturer';
}

export function isAdminUser(user: Actor): boolean {
  return user.role === 'lecturer' && !!user.is_admin;
}

// Only the class advisor (or an admin) may manage a class and its roster.
export function canManageClass(user: Actor, advisorId: number | null | undefined): boolean {
  return isAdminUser(user) || (isLecturer(user) && advisorId === user.id);
}

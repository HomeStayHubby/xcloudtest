import type { User } from '@elitequest/shared';
export type Actor = Pick<User, 'id' | 'role' | 'is_admin'>;
export declare function isLecturer(user: Actor): boolean;
export declare function isAdminUser(user: Actor): boolean;
export declare function canManageClass(user: Actor, advisorId: number | null | undefined): boolean;
//# sourceMappingURL=permissions.d.ts.map
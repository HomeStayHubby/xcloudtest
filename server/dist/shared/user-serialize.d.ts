import type { PublicUser } from '@elitequest/shared';
type UserRow = {
    id: number;
    email?: string | null;
    username?: string | null;
    password_hash: string;
    display_name: string;
    role: 'lecturer' | 'student';
    is_admin: number | boolean;
    class_id?: number | null;
    student_number?: string | null;
    is_active?: number | boolean;
    created_at: string | Date;
    updated_at?: string | Date;
};
export declare function toPublicUser(row: UserRow): PublicUser;
export {};
//# sourceMappingURL=user-serialize.d.ts.map
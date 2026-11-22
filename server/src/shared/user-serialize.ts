import type { PublicUser } from '@elitequest/shared';

// DB rows store booleans as 0/1; the API always speaks booleans and never
// exposes password_hash. Rows may come straight from SQLite (numbers) or be
// typed as the shared User shape (booleans), so both are accepted.
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

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email ?? null,
    username: row.username ?? null,
    display_name: row.display_name,
    role: row.role,
    is_admin: !!row.is_admin,
    class_id: row.class_id ?? null,
    is_active: row.is_active === undefined ? true : !!row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
  };
}

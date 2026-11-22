export function toPublicUser(row) {
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
//# sourceMappingURL=user-serialize.js.map
export function isLecturer(user) {
    return user.role === 'lecturer';
}
export function isAdminUser(user) {
    return user.role === 'lecturer' && !!user.is_admin;
}
// Only the class advisor (or an admin) may manage a class and its roster.
export function canManageClass(user, advisorId) {
    return isAdminUser(user) || (isLecturer(user) && advisorId === user.id);
}
//# sourceMappingURL=permissions.js.map
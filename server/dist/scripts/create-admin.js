import { createLecturer } from '../features/users/user.service.js';
import { runMigrations } from '../db/migrate.js';
async function main() {
    const email = process.argv[2];
    const password = process.argv[3];
    const displayName = process.argv[4] ?? email;
    if (!email || !password) {
        console.error('Usage: npm run create-admin -- <email> <password> [display-name]');
        process.exit(1);
    }
    await runMigrations();
    const user = await createLecturer({
        email,
        password,
        display_name: displayName,
        is_admin: true,
    });
    console.log('Admin lecturer created:', user.email);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=create-admin.js.map
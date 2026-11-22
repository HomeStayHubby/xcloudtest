import { database } from '../db/database.js';
import { runMigrations } from '../db/migrate.js';
import { execAsync, runAsync } from '../db/promises.js';
import { createLecturer } from '../features/users/user.service.js';
import { createClass } from '../features/classes/class.service.js';
import { createStudentAccount } from '../features/students/student.service.js';
import { createQuiz, releaseQuiz, setQuizStatus } from '../features/quizzes/quiz.service.js';
import { createQuestion } from '../features/questions/question.service.js';
let counter = 0;
export function uniqueId(prefix) {
    counter += 1;
    return `${prefix}${counter}`;
}
export async function setup() {
    await runMigrations();
    await wipeAll();
}
// Deletes every row in FK-safe order (connection has foreign_keys = ON).
export async function wipeAll() {
    await execAsync(database, 'DELETE FROM app_settings');
    await execAsync(database, 'DELETE FROM brainstorm_upvotes');
    await execAsync(database, 'DELETE FROM responses');
    await execAsync(database, 'DELETE FROM group_members');
    await execAsync(database, 'DELETE FROM groups');
    await execAsync(database, 'DELETE FROM questions');
    await execAsync(database, 'DELETE FROM quiz_releases');
    await execAsync(database, 'DELETE FROM campaign_quizzes');
    await execAsync(database, 'DELETE FROM campaigns');
    await execAsync(database, 'DELETE FROM games');
    await execAsync(database, 'DELETE FROM quizzes');
    await execAsync(database, 'DELETE FROM question_banks');
    // users <-> classes form a reference cycle (class_id / advisor_id): break it.
    await execAsync(database, 'UPDATE classes SET advisor_id = NULL');
    await execAsync(database, 'DELETE FROM users');
    await execAsync(database, 'DELETE FROM classes');
    counter = 0;
}
export async function makeLecturer(isAdmin = false, display) {
    const suffix = uniqueId('user');
    return createLecturer({
        email: `${suffix}@example.com`,
        password: 'password123',
        display_name: display ?? `Lecturer ${suffix}`,
        is_admin: isAdmin,
    });
}
export async function makeClass(advisor, name) {
    return createClass({ name: name ?? `Class ${uniqueId('C')}` }, advisor.id);
}
export async function makeStudent(advisor, classId, displayName) {
    const suffix = uniqueId('stu');
    return createStudentAccount(advisor, classId, {
        username: `user.${suffix.toLowerCase()}`,
        display_name: displayName ?? `Student ${suffix}`,
        password: 'studentpass',
    });
}
export async function makeOpenQuizForClass(advisor, classId, title, questionCount = 1) {
    const quiz = await createQuiz(advisor, { title: title ?? `Quiz ${uniqueId('Q')}` });
    await releaseQuiz(advisor, quiz.id, classId);
    for (let i = 0; i < questionCount; i++) {
        await createQuestion(advisor, quiz.id, {
            type: 'mcq_single',
            prompt: `Q${i + 1}: 2+2?`,
            data: {
                type: 'mcq_single',
                prompt: `Q${i + 1}: 2+2?`,
                options: [
                    { id: 'a', text: '4' },
                    { id: 'b', text: '5' },
                ],
                correct_option_id: 'a',
            },
            answer_mode: 'individual',
            points: 1,
        });
    }
    await setQuizStatus(advisor, quiz.id, 'open', ['draft', 'closed']);
    return quiz;
}
// Fast login helper for integration tests: creates a user and returns its id.
export async function seedUserRow(email, role, options = {}) {
    await runAsync(database, "INSERT INTO users (email, username, password_hash, display_name, role, is_admin, is_active) VALUES (?, ?, 'x', ?, ?, ?, ?)", email, options.username ?? null, email, role, options.is_admin ?? 0, options.is_active ?? 1);
    const row = await new Promise((resolve, reject) => {
        database.get('SELECT id FROM users WHERE email = ?', email, (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
    return row.id;
}
//# sourceMappingURL=helpers.js.map
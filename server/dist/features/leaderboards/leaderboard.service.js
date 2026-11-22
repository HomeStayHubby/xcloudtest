import { database } from '../../db/database.js';
import { allAsync } from '../../db/promises.js';
import { getClassById } from '../classes/class.service.js';
export async function getLeaderboard(classId) {
    await getClassById(classId);
    const individuals = await allAsync(database, `SELECT s.id AS student_id,
            s.display_name,
            COALESCE(SUM(r.score), 0) AS total_score,
            COUNT(r.id) AS responses
     FROM students s
     JOIN responses r ON r.student_id = s.id
     JOIN questions q ON q.id = r.question_id
     JOIN quizzes z ON z.id = q.quiz_id
     WHERE z.class_id = ? AND z.mode = 'campaign'
     GROUP BY s.id, s.display_name
     ORDER BY total_score DESC, s.display_name`, classId);
    const groups = await allAsync(database, `SELECT g.id AS group_id,
            g.name AS group_name,
            COALESCE(SUM(r.score), 0) AS total_score,
            COUNT(r.id) AS responses
     FROM groups g
     JOIN responses r ON r.group_id = g.id
     JOIN questions q ON q.id = r.question_id
     JOIN quizzes z ON z.id = q.quiz_id
     WHERE z.class_id = ? AND z.mode = 'campaign'
     GROUP BY g.id, g.name
     ORDER BY total_score DESC, g.name`, classId);
    return { class_id: classId, individuals, groups };
}
//# sourceMappingURL=leaderboard.service.js.map
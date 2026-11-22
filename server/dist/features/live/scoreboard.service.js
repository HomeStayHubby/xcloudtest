import { database } from '../../db/database.js';
import { allAsync } from '../../db/promises.js';
export async function getQuizScoreboard(quizId) {
    const individuals = await allAsync(database, `SELECT s.display_name AS name,
            COALESCE(SUM(r.score), 0) AS total_score,
            COUNT(r.id) AS responses
     FROM responses r
     JOIN questions q ON q.id = r.question_id
     JOIN users s ON s.id = r.student_id
     WHERE q.quiz_id = ? AND r.student_id IS NOT NULL
     GROUP BY s.id, s.display_name
     ORDER BY total_score DESC, name`, quizId);
    const groups = await allAsync(database, `SELECT g.name AS name,
            COALESCE(SUM(r.score), 0) AS total_score,
            COUNT(r.id) AS responses
     FROM responses r
     JOIN questions q ON q.id = r.question_id
     JOIN groups g ON g.id = r.group_id
     WHERE q.quiz_id = ? AND r.group_id IS NOT NULL
     GROUP BY g.id, g.name
     ORDER BY total_score DESC, name`, quizId);
    return { quiz_id: quizId, individuals, groups };
}
const scoreboardBroadcasters = [];
export function registerScoreboardBroadcaster(handler) {
    scoreboardBroadcasters.push(handler);
}
export async function broadcastScoreboard(quizId) {
    const scoreboard = await getQuizScoreboard(quizId);
    for (const handler of scoreboardBroadcasters) {
        handler(scoreboard);
    }
}
//# sourceMappingURL=scoreboard.service.js.map
import { database } from '../../db/database.js';
import { allAsync } from '../../db/promises.js';
import { getQuizById, assertStudentCanAccessQuiz, } from '../quizzes/quiz.service.js';
import { listQuestionsRawByQuiz } from '../questions/question.service.js';
import { getStudentGroup } from '../groups/group.service.js';
// The student's own (or their group's) per-question results for a quiz,
// including the answer key when the quiz settings allow revealing it.
export async function getMyQuizResults(studentId, quizId) {
    const quiz = await getQuizById(quizId);
    // Release-based access check; deliberately status-agnostic so students can
    // still read their summary after the instructor closes the quiz.
    await assertStudentCanAccessQuiz(studentId, quizId);
    const questions = await listQuestionsRawByQuiz(quizId);
    const group = await getStudentGroup(quizId, studentId);
    const rows = await allAsync(database, `SELECT r.question_id, r.student_id, r.group_id, r.answer, r.score, r.submitted_at
     FROM responses r
     JOIN questions q ON q.id = r.question_id
     WHERE q.quiz_id = ? AND (r.student_id = ? OR r.group_id = ?)
     ORDER BY r.submitted_at`, quizId, studentId, group?.id ?? -1);
    const byQuestion = new Map();
    for (const row of rows) {
        const question = questions.find((q) => q.id === row.question_id);
        if (!question)
            continue;
        // Group-mode questions: prefer the group's row; individual: my own row.
        const preferred = question.answer_mode === 'group'
            ? row.group_id !== null
            : row.student_id === studentId;
        const existing = byQuestion.get(row.question_id);
        if (!existing || preferred) {
            byQuestion.set(row.question_id, row);
        }
    }
    const reveal = quiz.settings.reveal_answers_in_summary;
    const items = questions.map((question) => {
        const response = byQuestion.get(question.id);
        const score = response?.score ?? null;
        return {
            question_id: question.id,
            order_index: question.order_index,
            prompt: question.prompt,
            type: question.type,
            answer_mode: question.answer_mode,
            points: question.points,
            my_answer_display: response
                ? formatMyAnswer(question, JSON.parse(response.answer))
                : null,
            score,
            correct: response === undefined || score === null
                ? null
                : question.points > 0
                    ? score >= question.points
                    : false,
            correct_answer: reveal ? describeCorrectAnswer(question.data) : null,
        };
    });
    const totalScore = items.reduce((sum, item) => sum + (item.score ?? 0), 0);
    const pointsPossible = questions.reduce((sum, q) => sum + q.points, 0);
    const answered = items.filter((item) => item.my_answer_display !== null).length;
    return {
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        quiz_status: quiz.status,
        reveal_answers: reveal,
        total_score: Math.round(totalScore * 100) / 100,
        points_possible: pointsPossible,
        answered,
        total_questions: questions.length,
        items,
    };
}
function optionText(data, id) {
    if (data.type === 'mcq_single' || data.type === 'mcq_multi') {
        return data.options.find((option) => option.id === id)?.text ?? id;
    }
    return id;
}
export function formatMyAnswer(question, answer) {
    const data = question.data;
    switch (data.type) {
        case 'mcq_single':
            return typeof answer === 'string' ? optionText(data, answer) : '—';
        case 'mcq_multi':
            return Array.isArray(answer)
                ? answer.map((id) => optionText(data, id)).join(', ') || '—'
                : '—';
        case 'short_answer':
            return typeof answer === 'string' && answer.trim() !== '' ? answer : '—';
        case 'fill_blanks': {
            const values = Array.isArray(answer) ? answer : [];
            return values.map((value) => String(value) || '—').join(' / ') || '—';
        }
        case 'matching': {
            if (answer === null || typeof answer !== 'object' || Array.isArray(answer))
                return '—';
            const lines = Object.entries(answer).map(([leftId, rightId]) => {
                const left = data.left_items.find((item) => item.id === leftId)?.text ?? leftId;
                const right = data.right_items.find((item) => item.id === rightId)?.text ?? rightId;
                return `${left} → ${right}`;
            });
            return lines.join('; ') || '—';
        }
        case 'grouping': {
            if (answer === null || typeof answer !== 'object' || Array.isArray(answer))
                return '—';
            const lines = data.items.map((item) => {
                const groupName = data.groups.find((group) => group.id === answer[item.id])?.name ?? 'Unassigned';
                return `${item.text} → ${groupName}`;
            });
            return lines.join('; ') || '—';
        }
        case 'word_cloud':
        case 'brainstorming':
            return Array.isArray(answer)
                ? answer.filter((word) => String(word).trim() !== '').join(', ') || '—'
                : '—';
        default:
            return '—';
    }
}
// Human-readable answer key; null for open-ended types with no fixed key.
export function describeCorrectAnswer(data) {
    switch (data.type) {
        case 'mcq_single':
            return optionText(data, data.correct_option_id);
        case 'mcq_multi':
            return data.correct_option_ids.map((id) => optionText(data, id)).join(', ');
        case 'short_answer':
            return data.accepted_answers.join(' / ');
        case 'fill_blanks': {
            const answers = data.segments
                .filter((segment) => segment.blank)
                .map((segment) => segment.answer ?? '—');
            return answers.join(' / ') || null;
        }
        case 'matching':
            return Object.entries(data.correct_pairs)
                .map(([leftId, rightId]) => {
                const left = data.left_items.find((item) => item.id === leftId)?.text ?? leftId;
                const right = data.right_items.find((item) => item.id === rightId)?.text ?? rightId;
                return `${left} → ${right}`;
            })
                .join('; ');
        case 'grouping':
            return data.items
                .map((item) => {
                const groupName = data.groups.find((group) => group.id === item.group_id)?.name ?? item.group_id;
                return `${item.text} → ${groupName}`;
            })
                .join('; ');
        case 'word_cloud':
        case 'brainstorming':
            return null;
        default:
            return null;
    }
}
//# sourceMappingURL=my-results.service.js.map
import { getQuizById, assertQuizOwner, assertStudentCanAccessQuiz } from '../quizzes/quiz.service.js';
import { advanceQuestion, getCurrentQuestionIndex, retreatQuestion, } from './pacing.service.js';
import { listQuestionsRawByQuiz } from '../questions/question.service.js';
import { notFound, badRequest } from '../../shared/errors.js';
import { getAuthUser } from '../auth/auth.middleware.js';
export async function getPacingState(req, res, next) {
    try {
        const quizId = Number(req.params.quizId);
        const quiz = await getQuizById(quizId);
        if (!quiz) {
            throw notFound('Quiz');
        }
        const user = getAuthUser(req);
        if (user.role === 'student') {
            await assertStudentCanAccessQuiz(user.id, quizId);
        }
        const questions = await listQuestionsRawByQuiz(quizId);
        const currentIndex = getCurrentQuestionIndex(quizId);
        const current = questions[currentIndex] ?? null;
        res.json({
            data: {
                quiz_id: quizId,
                current_index: currentIndex,
                question_id: current?.id ?? null,
                total_questions: questions.length,
                title: quiz.title,
            },
        });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function advance(req, res, next) {
    try {
        const quizId = Number(req.params.quizId);
        const user = getAuthUser(req);
        const quiz = await assertQuizOwner(user, quizId);
        if (!quiz) {
            throw notFound('Quiz');
        }
        const questions = await listQuestionsRawByQuiz(quizId);
        if (questions.length === 0) {
            throw badRequest('Quiz has no questions');
        }
        const newIndex = advanceQuestion(quizId, questions.length);
        broadcastPacing({
            quizId,
            currentIndex: newIndex,
            currentQuestionId: questions[newIndex]?.id ?? null,
        });
        res.json({
            data: {
                quiz_id: quizId,
                current_index: newIndex,
                question_id: questions[newIndex]?.id ?? null,
                total_questions: questions.length,
            },
        });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function retreat(req, res, next) {
    try {
        const quizId = Number(req.params.quizId);
        const user = getAuthUser(req);
        await assertQuizOwner(user, quizId);
        const questions = await listQuestionsRawByQuiz(quizId);
        const newIndex = retreatQuestion(quizId);
        broadcastPacing({
            quizId,
            currentIndex: newIndex,
            currentQuestionId: questions[newIndex]?.id ?? null,
        });
        res.json({
            data: {
                quiz_id: quizId,
                current_index: newIndex,
                question_id: questions[newIndex]?.id ?? null,
                total_questions: questions.length,
            },
        });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
const broadcastPacingHandlers = [];
export function registerBroadcaster(handler) {
    broadcastPacingHandlers.push(handler);
}
export function broadcastPacing(payload) {
    for (const handler of broadcastPacingHandlers) {
        handler(payload);
    }
}
//# sourceMappingURL=pacing.controller.js.map
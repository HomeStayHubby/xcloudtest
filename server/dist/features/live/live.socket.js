import { submitResponse } from '../responses/response.service.js';
import { getAggregationsByQuestion, upvoteBrainstormIdea } from './aggregation.service.js';
import { registerBroadcaster } from './pacing.controller.js';
import { registerScoreboardBroadcaster } from './scoreboard.service.js';
import { registerQuizClosedBroadcaster } from '../quizzes/quiz.service.js';
import { registerGameBroadcaster } from '../games/game.controller.js';
import { getSocketUser } from './socket-auth.js';
export function registerLiveSocketHandlers(io, sessionStore) {
    registerBroadcaster(({ quizId, currentIndex, currentQuestionId }) => {
        io.to(`quiz-${quizId}`).emit('pacing-update', {
            quiz_id: quizId,
            current_index: currentIndex,
            question_id: currentQuestionId,
        });
    });
    registerScoreboardBroadcaster((scoreboard) => {
        io.to(`quiz-${scoreboard.quiz_id}`).emit('scoreboard-update', scoreboard);
    });
    registerQuizClosedBroadcaster((quizId) => {
        io.to(`quiz-${quizId}`).emit('quiz-closed', { quiz_id: quizId });
    });
    registerGameBroadcaster((payload) => {
        io.to(`class-${payload.classId}`).emit('game-spin', payload);
    });
    io.on('connection', (socket) => {
        // Every socket must carry a valid server-side session; identity is never
        // taken from client-supplied handshake payloads.
        void getSocketUser(socket, sessionStore).then((user) => {
            if (user === undefined) {
                socket.emit('auth-error', { message: 'Login required' });
                socket.disconnect(true);
                return;
            }
            socket.data.userId = user.id;
            // Students always sit in their class room (live displays, game spins).
            if (user.role === 'student' && user.class_id !== null) {
                void socket.join(`class-${user.class_id}`);
            }
            socket.on('join-class', (classId) => {
                void socket.join(`class-${classId}`);
            });
            socket.on('leave-class', (classId) => {
                void socket.leave(`class-${classId}`);
            });
            socket.on('join-quiz', (quizId) => {
                void socket.join(`quiz-${quizId}`);
            });
            socket.on('leave-quiz', (quizId) => {
                void socket.leave(`quiz-${quizId}`);
            });
            socket.on('submit-answer', async (payload) => {
                try {
                    const response = await submitResponse(payload.questionId, user.id, payload.answer);
                    io.to(`question-${payload.questionId}`).emit('response-update', {
                        questionId: payload.questionId,
                    });
                    socket.emit('answer-accepted', { response });
                }
                catch (err) {
                    socket.emit('answer-error', {
                        message: err instanceof Error ? err.message : 'Submission failed',
                    });
                }
            });
            socket.on('watch-question', (questionId) => {
                void socket.join(`question-${questionId}`);
            });
            socket.on('unwatch-question', (questionId) => {
                void socket.leave(`question-${questionId}`);
            });
            socket.on('get-aggregation', async (questionId) => {
                try {
                    const data = await getAggregationsByQuestion(questionId);
                    socket.emit('aggregation', { questionId, data });
                }
                catch (err) {
                    socket.emit('aggregation-error', {
                        message: err instanceof Error ? err.message : 'Aggregation failed',
                    });
                }
            });
            socket.on('get-scoreboard', async (quizId) => {
                try {
                    const { getQuizScoreboard } = await import('./scoreboard.service.js');
                    const scoreboard = await getQuizScoreboard(quizId);
                    socket.emit('scoreboard-update', scoreboard);
                }
                catch (err) {
                    socket.emit('scoreboard-error', {
                        message: err instanceof Error ? err.message : 'Scoreboard failed',
                    });
                }
            });
            socket.on('upvote-idea', async (payload) => {
                try {
                    const data = await upvoteBrainstormIdea(payload.questionId, user.id, undefined, payload.idea);
                    io.to(`question-${payload.questionId}`).emit('aggregation', {
                        questionId: payload.questionId,
                        data,
                    });
                }
                catch (err) {
                    socket.emit('upvote-error', {
                        message: err instanceof Error ? err.message : 'Upvote failed',
                    });
                }
            });
        });
    });
}
//# sourceMappingURL=live.socket.js.map
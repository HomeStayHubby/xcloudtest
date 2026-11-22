const currentIndexByQuiz = new Map();
const questionStartedAtByQuiz = new Map();
export function getCurrentQuestionIndex(quizId) {
    return currentIndexByQuiz.get(quizId) ?? 0;
}
export function setCurrentQuestionIndex(quizId, index) {
    currentIndexByQuiz.set(quizId, Math.max(0, index));
    questionStartedAtByQuiz.set(quizId, Date.now());
    return currentIndexByQuiz.get(quizId);
}
export function getQuestionStartedAt(quizId) {
    return questionStartedAtByQuiz.get(quizId);
}
export function advanceQuestion(quizId, total) {
    const current = getCurrentQuestionIndex(quizId);
    const next = Math.min(current + 1, total - 1);
    return setCurrentQuestionIndex(quizId, next);
}
export function retreatQuestion(quizId) {
    const current = getCurrentQuestionIndex(quizId);
    const prev = Math.max(current - 1, 0);
    return setCurrentQuestionIndex(quizId, prev);
}
export function resetPacing(quizId) {
    currentIndexByQuiz.delete(quizId);
}
//# sourceMappingURL=pacing.service.js.map
const currentIndexByQuiz = new Map<number, number>();
const questionStartedAtByQuiz = new Map<number, number>();

export function getCurrentQuestionIndex(quizId: number): number {
  return currentIndexByQuiz.get(quizId) ?? 0;
}

export function setCurrentQuestionIndex(quizId: number, index: number): number {
  currentIndexByQuiz.set(quizId, Math.max(0, index));
  questionStartedAtByQuiz.set(quizId, Date.now());
  return currentIndexByQuiz.get(quizId)!;
}

export function getQuestionStartedAt(quizId: number): number | undefined {
  return questionStartedAtByQuiz.get(quizId);
}

export function advanceQuestion(quizId: number, total: number): number {
  const current = getCurrentQuestionIndex(quizId);
  const next = Math.min(current + 1, total - 1);
  return setCurrentQuestionIndex(quizId, next);
}

export function retreatQuestion(quizId: number): number {
  const current = getCurrentQuestionIndex(quizId);
  const prev = Math.max(current - 1, 0);
  return setCurrentQuestionIndex(quizId, prev);
}

export function resetPacing(quizId: number): void {
  currentIndexByQuiz.delete(quizId);
}

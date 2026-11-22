import { api } from './client.js';
import type { QuizResults } from '@elitequest/shared';
export type { QuizResults } from '@elitequest/shared';

function classQuery(classId?: number): string {
  return classId ? `?classId=${classId}` : '';
}

export function getQuizResults(quizId: number, classId?: number): Promise<QuizResults> {
  return api.get<QuizResults>(`/quizzes/${quizId}/results${classQuery(classId)}`);
}

export function exportQuizResults(quizId: number, classId?: number): void {
  window.location.href = `/api/v1/quizzes/${quizId}/results/export${classQuery(classId)}`;
}

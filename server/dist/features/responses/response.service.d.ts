import type { Actor } from '../../shared/permissions.js';
import type { Response, ResponseAnswer } from '@elitequest/shared';
export declare function submitResponse(questionId: number, studentId: number, answer: ResponseAnswer): Promise<Response>;
export declare function getResponseById(id: number): Promise<Response>;
export declare function getResponsesByQuiz(quizId: number): Promise<Response[]>;
export declare function getResponsesByQuizRaw(quizId: number): Promise<ResponseRow[]>;
export declare function setResponseScore(user: Actor, responseId: number, score: number): Promise<Response>;
export declare function setQuestionScores(user: Actor, questionId: number, score: number): Promise<{
    updated: number;
}>;
export type ResponseRow = Omit<Response, 'answer'> & {
    answer: string;
};
//# sourceMappingURL=response.service.d.ts.map
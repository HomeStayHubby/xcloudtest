import { createQuestionSchema, updateQuestionSchema } from '@elitequest/shared';
import { z } from 'zod';
import type { Question } from '@elitequest/shared';
import type { Actor } from '../../shared/permissions.js';
export type CreateQuestionInput = z.input<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.input<typeof updateQuestionSchema>;
export declare function listQuestionsByQuiz(user: Actor, quizId: number): Promise<Question[]>;
export declare function listQuestionsRawByQuiz(quizId: number): Promise<Question[]>;
export declare function getQuestionById(id: number): Promise<Question>;
export declare function createQuestion(user: Actor, quizId: number, input: CreateQuestionInput): Promise<Question>;
export declare function copyBankQuestionToQuiz(user: Actor, bankId: number, bankQuestionId: number, quizId: number): Promise<Question>;
export declare function updateQuestion(user: Actor, id: number, input: UpdateQuestionInput): Promise<Question>;
export declare function deleteQuestion(user: Actor, id: number): Promise<void>;
export declare function createBankQuestion(user: Actor, bankId: number, input: CreateQuestionInput): Promise<Question>;
//# sourceMappingURL=question.service.d.ts.map
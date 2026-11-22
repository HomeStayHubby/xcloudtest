import type { MyQuizResults, Question, QuestionData, ResponseAnswer } from '@elitequest/shared';
export declare function getMyQuizResults(studentId: number, quizId: number): Promise<MyQuizResults>;
export declare function formatMyAnswer(question: Question, answer: ResponseAnswer): string;
export declare function describeCorrectAnswer(data: QuestionData): string | null;
//# sourceMappingURL=my-results.service.d.ts.map
import type { Actor } from '../../shared/permissions.js';
import type { Quiz, QuizDetail, QuizRelease, QuizWithCampaign, CreateQuiz, UpdateQuiz, QuizStatus } from '@elitequest/shared';
export declare function listQuizzes(user: Actor): Promise<QuizDetail[]>;
export declare function getQuizById(id: number): Promise<Quiz>;
export declare function getQuizDetail(user: Actor, id: number): Promise<QuizDetail>;
export declare function createQuiz(user: Actor, input: CreateQuiz): Promise<Quiz>;
export declare function updateQuiz(user: Actor, id: number, input: UpdateQuiz): Promise<Quiz>;
export declare function deleteQuiz(user: Actor, id: number): Promise<void>;
export declare function assertQuizOwner(user: Actor, quizId: number): Promise<Quiz>;
export declare function registerQuizClosedBroadcaster(handler: (quizId: number) => void): void;
export declare function setQuizStatus(user: Actor, id: number, status: QuizStatus, allowedFrom?: QuizStatus[]): Promise<Quiz>;
export declare function releaseQuiz(user: Actor, quizId: number, classId: number): Promise<QuizRelease>;
export declare function unreleaseQuiz(user: Actor, quizId: number, classId: number): Promise<void>;
export declare function listOpenQuizzesForStudent(classId: number): Promise<QuizWithCampaign[]>;
export declare function listQuizzesForClass(classId: number): Promise<Quiz[]>;
export declare function assertStudentCanAccessQuiz(userId: number, quizId: number): Promise<void>;
export declare function getStudentClassId(userId: number): Promise<number | null>;
//# sourceMappingURL=quiz.service.d.ts.map
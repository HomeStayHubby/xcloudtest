import type { QuizScoreboard } from '@elitequest/shared';
export declare function getQuizScoreboard(quizId: number): Promise<QuizScoreboard>;
export declare function registerScoreboardBroadcaster(handler: (scoreboard: QuizScoreboard) => void): void;
export declare function broadcastScoreboard(quizId: number): Promise<void>;
//# sourceMappingURL=scoreboard.service.d.ts.map
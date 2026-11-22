import type { Request, Response, NextFunction } from 'express';
export declare function getPacingState(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function advance(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function retreat(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function registerBroadcaster(handler: (payload: {
    quizId: number;
    currentIndex: number;
    currentQuestionId: number | null;
}) => void): void;
export declare function broadcastPacing(payload: {
    quizId: number;
    currentIndex: number;
    currentQuestionId: number | null;
}): void;
//# sourceMappingURL=pacing.controller.d.ts.map
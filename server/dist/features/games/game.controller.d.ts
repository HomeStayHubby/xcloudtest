import type { Request, Response, NextFunction } from 'express';
export declare function index(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function store(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function show(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function update(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function remove(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function spin(req: Request, res: Response, next: NextFunction): Promise<void>;
export type GameSpinPayload = {
    classId: number;
    gameId: number;
    segment: string;
    segmentIndex: number;
};
export declare function registerGameBroadcaster(handler: (payload: GameSpinPayload) => void): void;
export declare function broadcastGameSpin(payload: GameSpinPayload): void;
//# sourceMappingURL=game.controller.d.ts.map
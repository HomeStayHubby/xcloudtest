import type { Game, CreateGame, UpdateGame } from '@elitequest/shared';
export declare function getGamesByClass(classId: number): Promise<(Game & {
    settings: unknown;
})[]>;
export declare function getGameById(id: number): Promise<Game>;
export declare function createGame(classId: number, input: CreateGame): Promise<Game>;
export declare function updateGame(id: number, input: UpdateGame): Promise<Game>;
export declare function deleteGame(id: number): Promise<void>;
export declare function spinWheel(segments: {
    label: string;
    weight: number;
}[]): {
    index: number;
    segment: {
        label: string;
        weight: number;
    };
};
//# sourceMappingURL=game.service.d.ts.map
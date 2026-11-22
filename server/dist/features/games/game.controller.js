import { z } from 'zod';
import { createGameSchema, updateGameSchema } from '@elitequest/shared';
import { createGame, getGameById, getGamesByClass, updateGame, deleteGame, spinWheel, } from './game.service.js';
import { badRequest } from '../../shared/errors.js';
const classIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
const gameIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export async function index(req, res, next) {
    try {
        const { id: classId } = classIdParamSchema.parse(req.params);
        const games = await getGamesByClass(classId);
        res.json({ data: games });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function store(req, res, next) {
    try {
        const { id: classId } = classIdParamSchema.parse(req.params);
        const input = createGameSchema.parse({ ...req.body, class_id: classId });
        const game = await createGame(classId, input);
        res.status(201).json({ data: game });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function show(req, res, next) {
    try {
        const { id } = gameIdParamSchema.parse(req.params);
        const game = await getGameById(id);
        res.json({ data: game });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function update(req, res, next) {
    try {
        const { id } = gameIdParamSchema.parse(req.params);
        const input = updateGameSchema.parse(req.body);
        const game = await updateGame(id, input);
        res.json({ data: game });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function remove(req, res, next) {
    try {
        const { id } = gameIdParamSchema.parse(req.params);
        await deleteGame(id);
        res.status(204).send();
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function spin(req, res, next) {
    try {
        const { id } = gameIdParamSchema.parse(req.params);
        const game = await getGameById(id);
        const settings = game.settings;
        if (game.type !== 'wheel_of_fortune' || settings.segments == null) {
            throw badRequest('Game is not a wheel of fortune');
        }
        const segments = settings.segments;
        const result = spinWheel(segments);
        broadcastGameSpin({
            classId: game.class_id,
            gameId: game.id,
            segment: result.segment.label,
            segmentIndex: result.index,
        });
        res.json({ data: result });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
const gameBroadcasters = [];
export function registerGameBroadcaster(handler) {
    gameBroadcasters.push(handler);
}
export function broadcastGameSpin(payload) {
    for (const handler of gameBroadcasters) {
        handler(payload);
    }
}
//# sourceMappingURL=game.controller.js.map
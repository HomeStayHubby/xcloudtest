import { z } from 'zod';
import { getLeaderboard } from './leaderboard.service.js';
const classIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});
export async function show(req, res, next) {
    try {
        const { id: classId } = classIdParamSchema.parse(req.params);
        const leaderboard = await getLeaderboard(classId);
        res.json({ data: leaderboard });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
//# sourceMappingURL=leaderboard.controller.js.map
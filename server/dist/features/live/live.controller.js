import { idParamSchema } from '../classes/class.validators.js';
import { getAggregationsByQuestion, upvoteBrainstormIdea } from './aggregation.service.js';
import { getAuthUser } from '../auth/auth.middleware.js';
export async function getAggregation(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const data = await getAggregationsByQuestion(id);
        res.json({ data });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function upvote(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const { idea } = req.body;
        const user = getAuthUser(req);
        const data = await upvoteBrainstormIdea(id, user.id, undefined, idea);
        res.json({ data });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
//# sourceMappingURL=live.controller.js.map
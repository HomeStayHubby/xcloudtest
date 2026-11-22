import { idParamSchema, createResponseSchema, manualScoreSchema } from './response.validators.js';
import { getAuthUser } from '../auth/auth.middleware.js';
import { submitResponse, setResponseScore, setQuestionScores } from './response.service.js';
export async function store(req, res, next) {
    try {
        const { id: questionId } = idParamSchema.parse(req.params);
        const { answer } = createResponseSchema.parse(req.body);
        const user = getAuthUser(req);
        const result = await submitResponse(questionId, user.id, answer);
        res.status(201).json({ data: result });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function updateScore(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const { score } = manualScoreSchema.parse(req.body);
        const user = getAuthUser(req);
        const result = await setResponseScore(user, id, score);
        res.json({ data: result });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function setScores(req, res, next) {
    try {
        const { id: questionId } = idParamSchema.parse(req.params);
        const { score } = manualScoreSchema.parse(req.body);
        const user = getAuthUser(req);
        const result = await setQuestionScores(user, questionId, score);
        res.json({ data: result });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
//# sourceMappingURL=response.controller.js.map
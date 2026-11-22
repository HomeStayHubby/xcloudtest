import { idParamSchema, campaignQuizParamsSchema, listCampaignsQuerySchema, addQuizSchema, createCampaignSchema, updateCampaignSchema, reorderPlaylistSchema, } from './campaign.validators.js';
import { listCampaignsByClass, getCampaignDetail, createCampaign, updateCampaign, deleteCampaign, addQuizToCampaign, removeQuizFromCampaign, reorderPlaylist, getCampaignResults, } from './campaign.service.js';
import { getAuthUser } from '../auth/auth.middleware.js';
export async function index(req, res, next) {
    try {
        const { class_id } = listCampaignsQuerySchema.parse(req.query);
        const campaigns = await listCampaignsByClass(class_id);
        res.json({ data: campaigns });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function show(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const campaign = await getCampaignDetail(id);
        res.json({ data: campaign });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function store(req, res, next) {
    try {
        const input = createCampaignSchema.parse(req.body);
        const campaign = await createCampaign(getAuthUser(req), input);
        res.status(201).json({ data: campaign });
    }
    catch (err) {
        next(err);
    }
}
export async function update(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const input = updateCampaignSchema.parse(req.body);
        const campaign = await updateCampaign(id, input);
        res.json({ data: campaign });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function remove(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        await deleteCampaign(id);
        res.status(204).send();
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function addQuiz(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const { quiz_id } = addQuizSchema.parse(req.body);
        const campaign = await addQuizToCampaign(getAuthUser(req), id, quiz_id);
        res.status(201).json({ data: campaign });
    }
    catch (err) {
        next(err);
    }
}
export async function removeQuiz(req, res, next) {
    try {
        const { id, quizId } = campaignQuizParamsSchema.parse(req.params);
        const campaign = await removeQuizFromCampaign(id, quizId);
        res.json({ data: campaign });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function reorder(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const { quiz_ids } = reorderPlaylistSchema.parse(req.body);
        const campaign = await reorderPlaylist(id, quiz_ids);
        res.json({ data: campaign });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
export async function results(req, res, next) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const campaignResults = await getCampaignResults(id);
        res.json({ data: campaignResults });
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
//# sourceMappingURL=campaign.controller.js.map
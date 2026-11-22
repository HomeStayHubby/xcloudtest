import { updateAiSettingsSchema } from '@elitequest/shared';
import { getAiSettings, updateAiSettings } from './settings.service.js';
export async function show(_req, res, next) {
    try {
        res.json({ data: await getAiSettings() });
    }
    catch (err) {
        next(err);
    }
}
export async function update(req, res, next) {
    try {
        const input = updateAiSettingsSchema.parse(req.body);
        res.json({ data: await updateAiSettings(input) });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=settings.controller.js.map
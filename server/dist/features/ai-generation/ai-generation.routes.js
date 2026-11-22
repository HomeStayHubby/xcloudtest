import { Router } from 'express';
import express from 'express';
import { requireLecturer } from '../auth/auth.middleware.js';
import { rateLimit } from '../../shared/rate-limit.js';
import * as controller from './ai-generation.controller.js';
export const aiGenerationRoutes = Router();
aiGenerationRoutes.use(requireLecturer);
// Mounted at /api/v1/ai. Generation is expensive (outbound API call), so a
// per-IP fixed-window limit applies on top of the lecturer requirement.
const generationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many AI generations, try again later',
});
aiGenerationRoutes.post('/extract-material', express.raw({ type: 'application/octet-stream', limit: '10mb' }), controller.extractMaterial);
aiGenerationRoutes.post('/generate-questions', generationLimiter, controller.generate);
aiGenerationRoutes.get('/models', controller.models);
//# sourceMappingURL=ai-generation.routes.js.map
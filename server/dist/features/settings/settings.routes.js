import { Router } from 'express';
import { requireAdmin } from '../auth/auth.middleware.js';
import { show, update } from './settings.controller.js';
export const settingsRoutes = Router();
settingsRoutes.use(requireAdmin);
// Mounted at /api/v1/settings.
settingsRoutes.get('/ai', show);
settingsRoutes.put('/ai', update);
//# sourceMappingURL=settings.routes.js.map
import { Router } from 'express';
import { show } from './leaderboard.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';
export const leaderboardRoutes = Router();
leaderboardRoutes.use(requireAuth);
leaderboardRoutes.get('/classes/:id/leaderboard', show);
//# sourceMappingURL=leaderboard.routes.js.map
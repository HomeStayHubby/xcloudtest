import { Router } from 'express';
import { store, updateScore, setScores } from './response.controller.js';
import { requireStudent, requireLecturer } from '../auth/auth.middleware.js';
export const responseRoutes = Router();
responseRoutes.post('/questions/:id/responses', requireStudent, store);
responseRoutes.patch('/responses/:id/score', requireLecturer, updateScore);
responseRoutes.post('/questions/:id/scores', requireLecturer, setScores);
//# sourceMappingURL=response.routes.js.map
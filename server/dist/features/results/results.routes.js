import { Router } from 'express';
import * as controller from './results.controller.js';
import { requireLecturer } from '../auth/auth.middleware.js';
export const resultsRoutes = Router();
resultsRoutes.use(requireLecturer);
resultsRoutes.get('/quizzes/:id/results', controller.getResults);
resultsRoutes.get('/quizzes/:id/results/export', controller.exportResults);
//# sourceMappingURL=results.routes.js.map
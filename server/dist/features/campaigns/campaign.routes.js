import { Router } from 'express';
import * as controller from './campaign.controller.js';
import { requireLecturer } from '../auth/auth.middleware.js';
export const campaignRoutes = Router();
campaignRoutes.use(requireLecturer);
campaignRoutes.get('/', controller.index);
campaignRoutes.post('/', controller.store);
campaignRoutes.get('/:id', controller.show);
campaignRoutes.patch('/:id', controller.update);
campaignRoutes.delete('/:id', controller.remove);
campaignRoutes.post('/:id/quizzes', controller.addQuiz);
campaignRoutes.put('/:id/quizzes/order', controller.reorder);
campaignRoutes.delete('/:id/quizzes/:quizId', controller.removeQuiz);
campaignRoutes.get('/:id/results', controller.results);
//# sourceMappingURL=campaign.routes.js.map
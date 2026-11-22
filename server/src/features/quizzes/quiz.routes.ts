import { Router } from 'express';
import * as controller from './quiz.controller.js';
import { requireLecturer } from '../auth/auth.middleware.js';

export const quizRoutes = Router();

quizRoutes.use(requireLecturer);

quizRoutes.get('/', controller.index);
quizRoutes.post('/', controller.store);
quizRoutes.get('/:id', controller.show);
quizRoutes.patch('/:id', controller.update);
quizRoutes.delete('/:id', controller.remove);
quizRoutes.post('/:id/open', controller.open);
quizRoutes.post('/:id/close', controller.close);
quizRoutes.post('/:id/releases', controller.release);
quizRoutes.delete('/:id/releases/:classId', controller.unrelease);

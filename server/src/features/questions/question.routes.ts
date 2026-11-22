import { Router } from 'express';
import * as controller from './question.controller.js';
import { requireLecturer } from '../auth/auth.middleware.js';

export const questionRoutes = Router();

questionRoutes.use(requireLecturer);

questionRoutes.get('/quizzes/:quizId/questions', controller.index);
questionRoutes.post('/quizzes/:quizId/questions', controller.store);
questionRoutes.post('/quizzes/:quizId/questions/from-bank', controller.copyFromBank);
questionRoutes.get('/questions/:id', controller.show);
questionRoutes.patch('/questions/:id', controller.update);
questionRoutes.delete('/questions/:id', controller.remove);

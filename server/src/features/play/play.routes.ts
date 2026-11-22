import { Router } from 'express';
import { listOpen, publicQuestions, scoreboard, myResults } from './play.controller.js';
import { requireStudent } from '../auth/auth.middleware.js';

export const playRoutes = Router();

playRoutes.use(requireStudent);

playRoutes.get('/open-quizzes', listOpen);
playRoutes.get('/quiz/:quizId/questions', publicQuestions);
playRoutes.get('/quiz/:quizId/scoreboard', scoreboard);
playRoutes.get('/quiz/:quizId/my-results', myResults);

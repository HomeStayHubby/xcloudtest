import { Router } from 'express';
import { getPacingState, advance, retreat } from './pacing.controller.js';
import { requireAuth, requireLecturer } from '../auth/auth.middleware.js';

export const pacingRoutes = Router();

pacingRoutes.get('/play/quiz/:quizId/pacing', requireAuth, getPacingState);
pacingRoutes.post('/quizzes/:quizId/pacing/advance', requireLecturer, advance);
pacingRoutes.post('/quizzes/:quizId/pacing/retreat', requireLecturer, retreat);

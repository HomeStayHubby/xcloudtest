import { Router } from 'express';
import { getAggregation, upvote } from './live.controller.js';
import { requireAuth, requireStudent } from '../auth/auth.middleware.js';

export const liveRoutes = Router();

liveRoutes.get('/questions/:id/aggregation', requireAuth, getAggregation);
liveRoutes.post('/questions/:id/upvote', requireStudent, upvote);

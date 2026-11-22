import { Router } from 'express';
import { login, logout, me } from './auth.controller.js';
import { rateLimit } from '../../shared/rate-limit.js';

export const authRoutes = Router();

// 10 attempts per 15 minutes per IP.
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, try again later',
});

authRoutes.post('/login', loginRateLimit, login);
authRoutes.post('/logout', logout);
authRoutes.get('/me', me);

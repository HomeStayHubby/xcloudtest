import { Router } from 'express';
import { requireAdmin } from '../auth/auth.middleware.js';
import { index, create, update, resetPassword } from './user.controller.js';
export const userRoutes = Router();
userRoutes.use(requireAdmin);
// Mounted at /api/v1/users.
userRoutes.get('/', index);
userRoutes.post('/', create);
userRoutes.patch('/:id', update);
userRoutes.post('/:id/password', resetPassword);
//# sourceMappingURL=user.routes.js.map
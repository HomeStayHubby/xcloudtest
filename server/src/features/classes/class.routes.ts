import { Router } from 'express';
import * as controller from './class.controller.js';
import { requireLecturer } from '../auth/auth.middleware.js';

export const classRoutes = Router();

classRoutes.use(requireLecturer);

classRoutes.get('/', controller.index);
classRoutes.post('/', controller.store);
classRoutes.get('/:id', controller.show);
classRoutes.patch('/:id', controller.update);
classRoutes.delete('/:id', controller.remove);

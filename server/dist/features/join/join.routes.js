import { Router } from 'express';
import { store } from './join.controller.js';
export const joinRoutes = Router();
joinRoutes.post('/', store);
//# sourceMappingURL=join.routes.js.map
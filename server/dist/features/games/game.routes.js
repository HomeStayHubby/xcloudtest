import { Router } from 'express';
import * as controller from './game.controller.js';
import { requireLecturer } from '../auth/auth.middleware.js';
export const gameRoutes = Router();
gameRoutes.use(requireLecturer);
gameRoutes.get('/classes/:id/games', controller.index);
gameRoutes.post('/classes/:id/games', controller.store);
gameRoutes.get('/games/:id', controller.show);
gameRoutes.patch('/games/:id', controller.update);
gameRoutes.delete('/games/:id', controller.remove);
gameRoutes.post('/games/:id/spin', controller.spin);
//# sourceMappingURL=game.routes.js.map
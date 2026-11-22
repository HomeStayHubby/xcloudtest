import { Router } from 'express';
import { requireLecturer } from '../auth/auth.middleware.js';
import * as controller from './question-bank.controller.js';
export const questionBankRoutes = Router();
questionBankRoutes.use(requireLecturer);
questionBankRoutes.get('/question-banks', controller.index);
questionBankRoutes.post('/question-banks', controller.store);
questionBankRoutes.get('/question-banks/:id', controller.show);
questionBankRoutes.patch('/question-banks/:id', controller.update);
questionBankRoutes.delete('/question-banks/:id', controller.remove);
questionBankRoutes.get('/question-banks/:id/questions', controller.questions);
questionBankRoutes.post('/question-banks/:id/questions', controller.storeQuestion);
//# sourceMappingURL=question-bank.routes.js.map
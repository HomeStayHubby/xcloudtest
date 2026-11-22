import { Router } from 'express';
import * as controller from './group.controller.js';
import { requireLecturer } from '../auth/auth.middleware.js';

export const groupRoutes = Router();

groupRoutes.use(requireLecturer);

groupRoutes.get('/quizzes/:quizId/groups', controller.index);
groupRoutes.post('/quizzes/:quizId/groups', controller.store);
groupRoutes.get('/groups/:id', controller.show);
groupRoutes.patch('/groups/:id', controller.update);
groupRoutes.delete('/groups/:id', controller.remove);
groupRoutes.get('/groups/:id/members', controller.listMembers);
groupRoutes.post('/groups/:id/members', controller.addMember);
groupRoutes.delete('/groups/:id/members/:studentId', controller.removeMember);

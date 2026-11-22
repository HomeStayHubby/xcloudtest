import { Router } from 'express';
import express from 'express';
import * as controller from './student.controller.js';
import { requireLecturer } from '../auth/auth.middleware.js';

export const studentRoutes = Router();

studentRoutes.use(requireLecturer);

studentRoutes.get('/classes/:id/students', controller.index);
studentRoutes.post('/classes/:id/students', controller.store);
studentRoutes.get('/students/:id', controller.show);
studentRoutes.patch('/students/:id', controller.update);
studentRoutes.post('/students/:id/password', controller.setPassword);
studentRoutes.delete('/students/:id', controller.remove);
studentRoutes.post('/classes/:id/students/bulk', controller.bulk);
studentRoutes.post(
  '/classes/:id/students/import',
  express.raw({ type: 'application/octet-stream', limit: '5mb' }),
  controller.importXlsx
);
studentRoutes.get('/classes/:id/students/export', controller.exportXlsx);

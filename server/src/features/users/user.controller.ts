import type { Request, Response, NextFunction } from 'express';
import {
  createLecturer,
  listLecturers,
  updateLecturer,
  resetLecturerPassword,
} from './user.service.js';
import {
  createLecturerSchema,
  updateLecturerSchema,
  resetPasswordSchema,
} from '@elitequest/shared';

export async function index(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ data: await listLecturers() });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createLecturerSchema.parse(req.body);
    res.status(201).json({ data: await createLecturer(input) });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const input = updateLecturerSchema.parse(req.body);
    res.json({ data: await updateLecturer(id, input) });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const input = resetPasswordSchema.parse(req.body);
    await resetLecturerPassword(id, input.password);
    res.json({ data: null });
  } catch (err) {
    next(err);
  }
}

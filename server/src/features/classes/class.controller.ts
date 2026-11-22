import type { Request, Response, NextFunction } from 'express';
import { createClassSchema, updateClassSchema, idParamSchema } from './class.validators.js';
import { getAuthUser } from '../auth/auth.middleware.js';
import {
  listClasses,
  getClassById,
  assertClassManager,
  createClass,
  updateClass,
  deleteClass,
} from './class.service.js';
import { forbidden } from '../../shared/errors.js';

export async function index(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const classes = await listClasses();
    res.json({ data: classes });
  } catch (err) {
    next(err);
  }
}

export async function show(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    // Any lecturer may view a class (they may teach it); write access is
    // advisor-only and enforced on the mutating endpoints.
    res.json({ data: await getClassById(id) });
  } catch (err) {
    next(err);
  }
}

export async function store(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createClassSchema.parse(req.body);
    const user = getAuthUser(req);
    const class_ = await createClass(input, user.id);
    res.status(201).json({ data: class_ });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = updateClassSchema.parse(req.body);
    const user = getAuthUser(req);

    const hasClassEdits =
      input.name !== undefined ||
      input.description !== undefined ||
      input.is_active !== undefined;
    if (hasClassEdits) {
      await assertClassManager(user, id);
    } else if (input.advisor_id === undefined) {
      throw forbidden('Nothing to update');
    }

    const class_ = await updateClass(id, input, user);
    res.json({ data: class_ });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const user = getAuthUser(req);
    await deleteClass(id, user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

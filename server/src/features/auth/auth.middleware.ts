import type { Request, Response, NextFunction } from 'express';
import { getUserById } from './auth.service.js';
import { unauthorized, forbidden } from '../../shared/errors.js';
import type { User } from '@elitequest/shared';

async function loadUser(req: Request): Promise<User> {
  const userId = req.session.userId;
  if (!userId) {
    throw unauthorized('Login required');
  }
  const user = await getUserById(userId);
  if (!user || !user.is_active) {
    throw unauthorized('Login required');
  }
  return user;
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    (req as Request & { user: User }).user = await loadUser(req);
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireLecturer(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await loadUser(req);
    if (user.role !== 'lecturer') {
      throw forbidden('Lecturer access required');
    }
    (req as Request & { user: User }).user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await loadUser(req);
    if (user.role !== 'lecturer' || !user.is_admin) {
      throw forbidden('Admin access required');
    }
    (req as Request & { user: User }).user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireStudent(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await loadUser(req);
    if (user.role !== 'student') {
      throw forbidden('Student access required');
    }
    (req as Request & { user: User }).user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function getAuthUser(req: Request): User {
  const user = (req as Request & { user?: User }).user;
  if (!user) {
    throw unauthorized('Login required');
  }
  return user;
}

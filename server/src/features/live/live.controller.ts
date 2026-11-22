import type { Request, Response, NextFunction } from 'express';
import { idParamSchema } from '../classes/class.validators.js';
import { getAggregationsByQuestion, upvoteBrainstormIdea } from './aggregation.service.js';
import { getAuthUser } from '../auth/auth.middleware.js';

export async function getAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = await getAggregationsByQuestion(id);
    res.json({ data });
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function upvote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const { idea } = req.body as { idea: string };
    const user = getAuthUser(req);
    const data = await upvoteBrainstormIdea(id, user.id, undefined, idea);
    res.json({ data });
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
  }
}

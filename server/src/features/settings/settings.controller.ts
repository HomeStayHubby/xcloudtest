import type { Request, Response, NextFunction } from 'express';
import { updateAiSettingsSchema } from '@elitequest/shared';
import { getAiSettings, updateAiSettings } from './settings.service.js';

export async function show(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ data: await getAiSettings() });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = updateAiSettingsSchema.parse(req.body);
    res.json({ data: await updateAiSettings(input) });
  } catch (err) {
    next(err);
  }
}

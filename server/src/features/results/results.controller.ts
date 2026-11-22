import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getQuizResults } from './results.service.js';
import { exportQuizResultsToXlsx } from './results.export.js';

const quizIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const resultsQuerySchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
});

export async function getResults(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = quizIdParamSchema.parse(req.params);
    const { classId } = resultsQuerySchema.parse(req.query);
    const results = await getQuizResults(id, classId);
    res.json({ data: results });
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function exportResults(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = quizIdParamSchema.parse(req.params);
    const { classId } = resultsQuerySchema.parse(req.query);
    const results = await getQuizResults(id, classId);
    const buffer = exportQuizResultsToXlsx(results);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    const suffix = classId ? `-class-${classId}` : '';
    res.setHeader('Content-Disposition', `attachment; filename="quiz-${id}-results${suffix}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
  }
}

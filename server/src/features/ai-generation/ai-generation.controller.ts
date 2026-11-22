import type { Request, Response, NextFunction } from 'express';
import {
  extractMaterialQuerySchema,
  modelsResponseSchema,
} from './ai-generation.schema.js';
import { generateQuestionsRequestSchema } from '@elitequest/shared';
import { badRequest } from '../../shared/errors.js';
import {
  extractMaterialText,
  generateQuestions,
  listGroqModels,
} from './ai-generation.service.js';

// Raw octet-stream upload, matching the XLSX roster import pattern. The file
// is parsed in memory and only the extracted text is returned.
export async function extractMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { filename } = extractMaterialQuerySchema.parse(req.query);
    const buffer = req.body as Buffer | undefined;
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw badRequest('Request body must be the raw file bytes.');
    }
    res.json({ data: await extractMaterialText(buffer, filename) });
  } catch (err) {
    next(err);
  }
}

export async function generate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = generateQuestionsRequestSchema.parse(req.body);
    res.json({ data: await generateQuestions(input) });
  } catch (err) {
    next(err);
  }
}

export async function models(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({ data: modelsResponseSchema.parse({ models: await listGroqModels() }) });
  } catch (err) {
    next(err);
  }
}

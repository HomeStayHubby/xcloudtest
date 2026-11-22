import { api } from './client.js';
import type {
  ExtractedMaterial,
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
} from '@elitequest/shared';
export type {
  ExtractedMaterial,
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  CandidateQuestion,
} from '@elitequest/shared';

// Raw binary upload (bypasses the JSON helper) — unwraps the same `{ data }`
// envelope. The server parses the file in memory and returns extracted text.
export async function extractMaterial(
  filename: string,
  file: File
): Promise<ExtractedMaterial> {
  const buffer = await file.arrayBuffer();
  const response = await fetch(
    `/api/v1/ai/extract-material?filename=${encodeURIComponent(filename)}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    }
  );

  const json = (await response.json()) as { data?: ExtractedMaterial; message?: string };

  if (!response.ok || !json.data) {
    throw new Error(json.message ?? 'Extraction failed');
  }

  return json.data;
}

export function generateQuestions(
  input: GenerateQuestionsRequest
): Promise<GenerateQuestionsResponse> {
  return api.post<GenerateQuestionsResponse>('/ai/generate-questions', input);
}

export function listAiModels(): Promise<string[]> {
  return api.get<{ models: string[] }>('/ai/models').then((r) => r.models);
}

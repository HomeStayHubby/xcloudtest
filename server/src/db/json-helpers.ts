import { questionDataSchema, quizSettingsSchema } from '@elitequest/shared';
import type { QuestionData, QuizSettings } from '@elitequest/shared';

export function parseQuestionData(raw: string): QuestionData {
  const parsed = JSON.parse(raw) as unknown;
  return questionDataSchema.parse(parsed);
}

export function stringifyQuestionData(data: QuestionData): string {
  return JSON.stringify(questionDataSchema.parse(data));
}

export function parseQuizSettings(raw: string): QuizSettings {
  const parsed = JSON.parse(raw) as unknown;
  return quizSettingsSchema.parse(parsed);
}

export function stringifyQuizSettings(settings: QuizSettings): string {
  return JSON.stringify(quizSettingsSchema.parse(settings));
}

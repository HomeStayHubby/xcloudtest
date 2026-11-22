import { api } from './client.js';
import type { QuestionBank, QuestionBankDetail, CreateQuestionBank, UpdateQuestionBank, Question, CreateQuestion } from '@elitequest/shared';

export type { QuestionBank, QuestionBankDetail, CreateQuestionBank, UpdateQuestionBank } from '@elitequest/shared';

export function listBanks(): Promise<QuestionBankDetail[]> {
  return api.get<QuestionBankDetail[]>('/question-banks');
}

export function getBank(id: number): Promise<QuestionBankDetail> {
  return api.get<QuestionBankDetail>(`/question-banks/${id}`);
}

export function createBank(input: CreateQuestionBank): Promise<QuestionBankDetail> {
  return api.post<QuestionBankDetail>('/question-banks', input);
}

export function updateBank(id: number, input: UpdateQuestionBank): Promise<QuestionBankDetail> {
  return api.patch<QuestionBankDetail>(`/question-banks/${id}`, input);
}

export function deleteBank(id: number): Promise<void> {
  return api.delete<void>(`/question-banks/${id}`);
}

export function listBankQuestions(bankId: number): Promise<Question[]> {
  return api.get<Question[]>(`/question-banks/${bankId}/questions`);
}

export function createBankQuestion(bankId: number, input: CreateQuestion): Promise<Question> {
  return api.post<Question>(`/question-banks/${bankId}/questions`, input);
}

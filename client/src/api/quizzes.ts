import { api } from './client.js';
export type {
  Quiz,
  QuizDetail,
  QuizRelease,
  CreateQuiz,
  UpdateQuiz,
  Question,
  CreateQuestion,
  UpdateQuestion,
  Group,
  CreateGroup,
  StudentAccount,
} from '@elitequest/shared';
import type {
  Quiz,
  QuizDetail,
  QuizRelease,
  CreateQuiz,
  UpdateQuiz,
  Question,
  CreateQuestion,
  UpdateQuestion,
  Group,
  CreateGroup,
  GroupMember,
  StudentAccount,
} from '@elitequest/shared';

export function listQuizzes(): Promise<QuizDetail[]> {
  return api.get<QuizDetail[]>('/quizzes');
}

export function getQuiz(id: number): Promise<QuizDetail> {
  return api.get<QuizDetail>(`/quizzes/${id}`);
}

export function createQuiz(input: CreateQuiz): Promise<Quiz> {
  return api.post<Quiz>('/quizzes', input);
}

export function updateQuiz(id: number, input: UpdateQuiz): Promise<Quiz> {
  return api.patch<Quiz>(`/quizzes/${id}`, input);
}

export function deleteQuiz(id: number): Promise<void> {
  return api.delete<void>(`/quizzes/${id}`);
}

export function openQuiz(id: number): Promise<Quiz> {
  return api.post<Quiz>(`/quizzes/${id}/open`, {});
}

export function closeQuiz(id: number): Promise<Quiz> {
  return api.post<Quiz>(`/quizzes/${id}/close`, {});
}

// Releases

export function releaseQuiz(quizId: number, classId: number): Promise<QuizRelease> {
  return api.post<QuizRelease>(`/quizzes/${quizId}/releases`, { class_id: classId });
}

export function unreleaseQuiz(quizId: number, classId: number): Promise<void> {
  return api.delete<void>(`/quizzes/${quizId}/releases/${classId}`);
}

// Questions

export function listQuestions(quizId: number): Promise<Question[]> {
  return api.get<Question[]>(`/quizzes/${quizId}/questions`);
}

export function createQuestion(quizId: number, input: CreateQuestion): Promise<Question> {
  return api.post<Question>(`/quizzes/${quizId}/questions`, input);
}

export function copyQuestionFromBank(
  quizId: number,
  bankId: number,
  questionId: number
): Promise<Question> {
  return api.post<Question>(`/quizzes/${quizId}/questions/from-bank`, {
    bank_id: bankId,
    question_id: questionId,
  });
}

export function updateQuestion(id: number, input: UpdateQuestion): Promise<Question> {
  return api.patch<Question>(`/questions/${id}`, input);
}

export function deleteQuestion(id: number): Promise<void> {
  return api.delete<void>(`/questions/${id}`);
}

// Quiz groups (members are students of any released class)

export type GroupWithMembers = Group & { members: StudentAccount[] };

export function listGroups(quizId: number): Promise<GroupWithMembers[]> {
  return api.get<GroupWithMembers[]>(`/quizzes/${quizId}/groups`);
}

export function createGroup(quizId: number, input: CreateGroup): Promise<Group> {
  return api.post<Group>(`/quizzes/${quizId}/groups`, input);
}

export function deleteGroup(id: number): Promise<void> {
  return api.delete<void>(`/groups/${id}`);
}

export function addGroupMember(groupId: number, studentId: number): Promise<GroupMember> {
  return api.post<GroupMember>(`/groups/${groupId}/members`, { student_id: studentId });
}

export function removeGroupMember(groupId: number, studentId: number): Promise<void> {
  return api.delete<void>(`/groups/${groupId}/members/${studentId}`);
}

export async function advanceQuizPacing(quizId: number): Promise<{
  current_index: number;
  question_id: number | null;
  total_questions: number;
}> {
  return api.post(`/quizzes/${quizId}/pacing/advance`, {});
}

export async function retreatQuizPacing(quizId: number): Promise<{
  current_index: number;
  question_id: number | null;
  total_questions: number;
}> {
  return api.post(`/quizzes/${quizId}/pacing/retreat`, {});
}

import { api } from './client.js';
import type { PublicUser, CreateLecturer, UpdateLecturer } from '@elitequest/shared';

export type { PublicUser, CreateLecturer, UpdateLecturer } from '@elitequest/shared';

export function listUsers(): Promise<PublicUser[]> {
  return api.get<PublicUser[]>('/users');
}

export function createLecturer(input: CreateLecturer): Promise<PublicUser> {
  return api.post<PublicUser>('/users', input);
}

export function updateLecturer(id: number, input: UpdateLecturer): Promise<PublicUser> {
  return api.patch<PublicUser>(`/users/${id}`, input);
}

export function resetLecturerPassword(id: number, password: string): Promise<void> {
  return api.post(`/users/${id}/password`, { password });
}

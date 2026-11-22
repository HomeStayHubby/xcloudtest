import { api } from './client.js';
import type { Game, CreateGame, UpdateGame } from '@elitequest/shared';
export type { Game, CreateGame, UpdateGame } from '@elitequest/shared';

export function listGames(classId: number): Promise<Game[]> {
  return api.get<Game[]>(`/classes/${classId}/games`);
}

export function createGame(classId: number, input: Omit<CreateGame, 'class_id'>): Promise<Game> {
  return api.post<Game>(`/classes/${classId}/games`, input);
}

export function getGame(id: number): Promise<Game> {
  return api.get<Game>(`/games/${id}`);
}

export function updateGame(id: number, input: UpdateGame): Promise<Game> {
  return api.patch<Game>(`/games/${id}`, input);
}

export function deleteGame(id: number): Promise<void> {
  return api.delete<void>(`/games/${id}`);
}

export function spinGame(
  id: number
): Promise<{ index: number; segment: { label: string; weight: number } }> {
  return api.post(`/games/${id}/spin`, {});
}

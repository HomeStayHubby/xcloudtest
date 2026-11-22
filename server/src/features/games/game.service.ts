import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { notFound } from '../../shared/errors.js';
import { getClassById } from '../classes/class.service.js';
import type { Game, CreateGame, UpdateGame } from '@elitequest/shared';

function parseSettings(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function getGamesByClass(classId: number): Promise<(Game & { settings: unknown })[]> {
  return new Promise(async (resolve, reject) => {
    try {
      await getClassById(classId);
      const rows = await allAsync<Omit<Game, 'settings'> & { settings: string }>(
        database,
        'SELECT * FROM games WHERE class_id = ? ORDER BY created_at DESC',
        classId
      );
      resolve(
        rows.map((row) => ({
          ...row,
          settings: parseSettings(row.settings),
        })) as (Game & { settings: unknown })[]
      );
    } catch (err) {
      reject(err);
    }
  });
}

export async function getGameById(id: number): Promise<Game> {
  const row = await getAsync<Omit<Game, 'settings'> & { settings: string }>(
    database,
    'SELECT * FROM games WHERE id = ?',
    id
  );
  if (!row) {
    throw notFound('Game');
  }
  return {
    ...row,
    settings: parseSettings(row.settings),
  } as unknown as Game;
}

export async function createGame(classId: number, input: CreateGame): Promise<Game> {
  await getClassById(classId);
  const settings = JSON.stringify(input.settings);
  await runAsync(
    database,
    'INSERT INTO games (class_id, name, type, settings) VALUES (?, ?, ?, ?)',
    classId,
    input.name,
    input.type,
    settings
  );
  const created = await getAsync<{ id: number }>(database, 'SELECT last_insert_rowid() as id');
  if (!created) {
    throw new Error('Failed to create game');
  }
  return getGameById(created.id);
}

export async function updateGame(id: number, input: UpdateGame): Promise<Game> {
  const existing = await getGameById(id);
  const settingsRaw = input.settings ? JSON.stringify(input.settings) : null;
  await runAsync(
    database,
    'UPDATE games SET name = ?, settings = ? WHERE id = ?',
    input.name ?? existing.name,
    settingsRaw ?? JSON.stringify(existing.settings ?? {}).toString(),
    id
  );
  return getGameById(id);
}

export async function deleteGame(id: number): Promise<void> {
  await getGameById(id);
  await runAsync(database, 'DELETE FROM games WHERE id = ?', id);
}

export function spinWheel(segments: { label: string; weight: number }[]): {
  index: number;
  segment: { label: string; weight: number };
} {
  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight <= 0) {
    return { index: 0, segment: segments[0] };
  }
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < segments.length; i++) {
    roll -= segments[i].weight;
    if (roll <= 0) {
      return { index: i, segment: segments[i] };
    }
  }
  return { index: 0, segment: segments[0] };
}


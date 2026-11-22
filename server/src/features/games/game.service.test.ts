import { describe, it, expect, beforeEach } from 'vitest';
import { createGame, getGameById, getGamesByClass, deleteGame, spinWheel } from './game.service.js';
import { setup, makeLecturer, makeClass } from '../../testing/helpers.js';

describe('game service', () => {
  let lecturer: Awaited<ReturnType<typeof makeLecturer>>;
  let classId: number;

  beforeEach(async () => {
    await setup();
    lecturer = await makeLecturer();
    classId = (await makeClass(lecturer)).id;
  });

  it('creates and lists games per class', async () => {
    await createGame(classId, {
      class_id: classId,
      name: 'Friday Wheel',
      type: 'wheel_of_fortune',
      settings: {
        kind: 'wheel_of_fortune',
        segments: [
          { label: '+1 point', weight: 3 },
          { label: 'Bonus question', weight: 1 },
        ],
      },
    });
    const games = await getGamesByClass(classId);
    expect(games).toHaveLength(1);
    expect(games[0].name).toBe('Friday Wheel');
  });

  it('deletes a game', async () => {
    const game = await createGame(classId, {
      class_id: classId,
      name: 'Jeopardy',
      type: 'jeopardy',
      settings: {
        kind: 'jeopardy',
        categories: [{ id: 'c1', name: 'Terms' }],
        cells: [{ id: 'cell1', category_id: 'c1', points: 100, prompt: 'What is homeostasis?' }],
      },
    });
    await deleteGame(game.id);
    await expect(getGameById(game.id)).rejects.toThrow('Game not found');
  });

  it('wheel spin respects weights and returns a segment', () => {
    const segments = [
      { label: 'A', weight: 1 },
      { label: 'B', weight: 3 },
      { label: 'C', weight: 1 },
    ];
    const result = spinWheel(segments);
    expect(['A', 'B', 'C']).toContain(result.segment.label);
    expect(result.index).toBeGreaterThanOrEqual(0);
    expect(result.index).toBeLessThan(3);
  });
});

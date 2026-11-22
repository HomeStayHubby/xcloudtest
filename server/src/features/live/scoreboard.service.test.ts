import { describe, it, expect, beforeEach } from 'vitest';
import { submitResponse } from '../responses/response.service.js';
import { getQuizScoreboard } from './scoreboard.service.js';
import {
  setup,
  makeLecturer,
  makeClass,
  makeStudent,
  makeOpenQuizForClass,
} from '../../testing/helpers.js';
import { createQuestion } from '../questions/question.service.js';

describe('scoreboard service', () => {
  let lecturer: Awaited<ReturnType<typeof makeLecturer>>;
  let classId: number;

  beforeEach(async () => {
    await setup();
    lecturer = await makeLecturer();
    classId = (await makeClass(lecturer)).id;
  });

  it('returns empty scoreboard for a quiz with no responses', async () => {
    const quiz = await makeOpenQuizForClass(lecturer, classId, 'Empty');
    const result = await getQuizScoreboard(quiz.id);
    expect(result.individuals).toHaveLength(0);
    expect(result.groups).toHaveLength(0);
  });

  it('aggregates individual scores for a quiz', async () => {
    const student = await makeStudent(lecturer, classId, 'Alice');
    const quiz = await makeOpenQuizForClass(lecturer, classId, 'Quiz', 0);

    for (let i = 0; i < 2; i++) {
      const q = await createQuestion(lecturer, quiz.id, {
        type: 'short_answer',
        prompt: `Q${i}`,
        data: {
          type: 'short_answer',
          prompt: `Q${i}`,
          accepted_answers: ['a'],
          case_sensitive: false,
        },
        answer_mode: 'individual',
        points: 1,
      });
      await submitResponse(q.id, student.id, 'a');
    }

    const result = await getQuizScoreboard(quiz.id);
    expect(result.individuals).toHaveLength(1);
    expect(result.individuals[0].name).toBe('Alice');
    expect(result.individuals[0].total_score).toBe(2);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { setQuizStatus } from '../quizzes/quiz.service.js';
import { createQuestion } from '../questions/question.service.js';
import { sanitizeQuestion } from './sanitize.js';
import { setup, makeLecturer, makeClass, makeOpenQuizForClass } from '../../testing/helpers.js';

describe('sanitizeQuestion', () => {
  let lecturer: Awaited<ReturnType<typeof makeLecturer>>;
  let classId: number;
  let quizId: number;

  beforeEach(async () => {
    await setup();
    lecturer = await makeLecturer();
    classId = (await makeClass(lecturer)).id;
    const quiz = await makeOpenQuizForClass(lecturer, classId, 'Quiz', 0);
    quizId = quiz.id;
    void setQuizStatus;
  });

  function mcq(prompt: string) {
    return {
      type: 'mcq_single' as const,
      prompt,
      options: [
        { id: 'a', text: '3' },
        { id: 'b', text: '4' },
      ],
      correct_option_id: 'b',
    };
  }

  async function makeQuestion(data: Parameters<typeof createQuestion>[2]['data'], type: Parameters<typeof createQuestion>[2]['type'], answerMode: 'individual' | 'group' = 'individual') {
    return createQuestion(lecturer, quizId, {
      type,
      prompt: 'q',
      data,
      answer_mode: answerMode,
      points: 1,
    });
  }

  it('strips answers from MCQ and short answer questions', async () => {
    const mcqQuestion = await makeQuestion(mcq('2+2?'), 'mcq_single');

    const publicData = sanitizeQuestion(mcqQuestion).data;
    expect(publicData.type).toBe('mcq_single');
    if (publicData.type === 'mcq_single') {
      expect('correct_option_id' in publicData).toBe(false);
      expect(publicData.options[0].text).toBe('3');
    }
  });

  it('keeps structure for matching/grouping while removing pair answers', async () => {
    const matching = await makeQuestion(
      {
        type: 'matching',
        prompt: 'q',
        left_items: [{ id: 'l1', text: '1' }],
        right_items: [{ id: 'r1', text: 'one' }],
        correct_pairs: { l1: 'r1' },
      },
      'matching'
    );
    const publicMatching = sanitizeQuestion(matching).data;
    if (publicMatching.type === 'matching') {
      expect('correct_pairs' in publicMatching).toBe(false);
    }

    const grouping = await makeQuestion(
      {
        type: 'grouping',
        prompt: 'q',
        groups: [{ id: 'g1', name: 'Numbers' }],
        items: [{ id: 'i1', text: '4', group_id: 'g1' }],
      },
      'grouping'
    );
    const publicGrouping = sanitizeQuestion(grouping).data;
    if (publicGrouping.type === 'grouping') {
      expect('group_id' in publicGrouping.items[0]).toBe(false);
    }
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { submitResponse } from '../responses/response.service.js';
import { setQuizStatus } from '../quizzes/quiz.service.js';
import { releaseQuiz } from '../quizzes/quiz.service.js';
import { createQuestion } from '../questions/question.service.js';
import { createQuiz } from '../quizzes/quiz.service.js';
import { getAggregationsByQuestion, upvoteBrainstormIdea } from './aggregation.service.js';
import { setup, makeLecturer, makeClass, makeStudent } from '../../testing/helpers.js';

describe('aggregation service', () => {
  let lecturer: Awaited<ReturnType<typeof makeLecturer>>;
  let classId: number;

  beforeEach(async () => {
    await setup();
    lecturer = await makeLecturer();
    classId = (await makeClass(lecturer)).id;
  });

  it('aggregates word cloud responses', async () => {
    const student = await makeStudent(lecturer, classId, 'A');
    const quiz = await createQuiz(lecturer, { title: 'Live' });
    await releaseQuiz(lecturer, quiz.id, classId);
    const question = await createQuestion(lecturer, quiz.id, {
      type: 'word_cloud',
      prompt: 'Describe this course in one word.',
      answer_mode: 'individual',
      points: 0,
      data: {
        type: 'word_cloud',
        prompt: 'Describe this course in one word.',
        max_words_per_student: 3,
      },
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft']);

    await submitResponse(question.id, student.id, ['fun', 'engaging']);

    const result = await getAggregationsByQuestion(question.id);
    expect(result.type).toBe('word_cloud');
    if (result.type === 'word_cloud') {
      expect(result.words).toHaveLength(2);
      expect(result.words.find((w) => w.word === 'fun')?.count).toBe(1);
    }
  });

  it('aggregates brainstorming responses and upvotes', async () => {
    const student = await makeStudent(lecturer, classId, 'A');
    const quiz = await createQuiz(lecturer, { title: 'Brainstorm' });
    await releaseQuiz(lecturer, quiz.id, classId);
    const question = await createQuestion(lecturer, quiz.id, {
      type: 'brainstorming',
      prompt: 'Ideas for improving study groups.',
      answer_mode: 'individual',
      points: 0,
      data: {
        type: 'brainstorming',
        prompt: 'Ideas for improving study groups.',
        allow_upvotes: true,
      },
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft']);

    await submitResponse(question.id, student.id, ['More breaks']);

    const result = await upvoteBrainstormIdea(question.id, student.id, undefined, 'More breaks');
    expect(result.type).toBe('brainstorming');
    if (result.type === 'brainstorming') {
      expect(result.ideas[0].upvotes).toBe(1);
    }
  });
});

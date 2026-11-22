import { describe, it, expect, beforeEach } from 'vitest';
import {
  createQuiz,
  getQuizById,
  getQuizDetail,
  listQuizzes,
  setQuizStatus,
  listOpenQuizzesForStudent,
  releaseQuiz,
  unreleaseQuiz,
} from './quiz.service.js';
import { assertQuizOwner } from './quiz.service.js';
import { setup, makeLecturer, makeClass, makeStudent, makeOpenQuizForClass } from '../../testing/helpers.js';
import { notFound } from '../../shared/errors.js';

describe('quiz service', () => {
  let lecturer: Awaited<ReturnType<typeof makeLecturer>>;
  let classId: number;

  beforeEach(async () => {
    await setup();
    lecturer = await makeLecturer();
    classId = (await makeClass(lecturer)).id;
  });

  it('creates a quiz owned by its creator', async () => {
    const quiz = await createQuiz(lecturer, { title: 'Sample Quiz' });
    expect(quiz.title).toBe('Sample Quiz');
    expect(quiz.status).toBe('draft');
    expect(quiz.created_by).toBe(lecturer.id);
  });

  it('lists only the owner quizzes (admin sees all)', async () => {
    const other = await makeLecturer();
    await createQuiz(lecturer, { title: 'Quiz 1' });
    await createQuiz(other, { title: 'Quiz 2' });

    const mine = await listQuizzes(lecturer);
    expect(mine.map((q) => q.title)).toEqual(['Quiz 1']);

    const admin = await makeLecturer(true);
    const all = await listQuizzes(admin);
    expect(all).toHaveLength(2);
  });

  it('opens and closes a quiz', async () => {
    const quiz = await createQuiz(lecturer, { title: 'Quiz' });
    const opened = await setQuizStatus(lecturer, quiz.id, 'open', ['draft', 'closed']);
    expect(opened.status).toBe('open');
    const closed = await setQuizStatus(lecturer, quiz.id, 'closed', ['open']);
    expect(closed.status).toBe('closed');
  });

  it('enforces ownership on status changes', async () => {
    const outsider = await makeLecturer();
    const quiz = await createQuiz(lecturer, { title: 'Quiz' });
    await expect(setQuizStatus(outsider, quiz.id, 'open', ['draft'])).rejects.toThrow(
      'Quiz not found'
    );
    await expect(assertQuizOwner(outsider, quiz.id)).rejects.toThrow();
    const detail = await getQuizDetail(lecturer, quiz.id);
    expect(detail.created_by).toBe(lecturer.id);
    expect(notFound('x').statusCode).toBe(404);
  });

  describe('releases', () => {
    it('releases a quiz to multiple classes and un-releases', async () => {
      const classB = await makeClass(lecturer);
      const quiz = await createQuiz(lecturer, { title: 'Multi' });

      await releaseQuiz(lecturer, quiz.id, classId);
      await releaseQuiz(lecturer, quiz.id, classB.id);

      let detail = await getQuizDetail(lecturer, quiz.id);
      expect(detail.releases).toHaveLength(2);

      await expect(releaseQuiz(lecturer, quiz.id, classId)).rejects.toThrow(
        'already released'
      );

      await unreleaseQuiz(lecturer, quiz.id, classId);
      detail = await getQuizDetail(lecturer, quiz.id);
      expect(detail.releases).toHaveLength(1);
    });

    it('rejects releases by non-owners', async () => {
      const outsider = await makeLecturer();
      const quiz = await createQuiz(lecturer, { title: 'Mine' });
      await expect(releaseQuiz(outsider, quiz.id, classId)).rejects.toThrow('Quiz not found');
    });

    it('rejects releases to unknown classes', async () => {
      const quiz = await createQuiz(lecturer, { title: 'Mine' });
      await expect(releaseQuiz(lecturer, quiz.id, 99999)).rejects.toThrow('Class not found');
    });
  });

  describe('student open quizzes', () => {
    it('returns open quizzes released to the student class', async () => {
      const quiz = await createQuiz(lecturer, { title: 'Open Quiz' });
      await releaseQuiz(lecturer, quiz.id, classId);
      await setQuizStatus(lecturer, quiz.id, 'open', ['draft', 'closed']);

      const results = await listOpenQuizzesForStudent(classId);
      expect(results.map((q) => q.id)).toEqual([quiz.id]);
    });

    it('hides drafts, closed and unreleased quizzes', async () => {
      const draft = await createQuiz(lecturer, { title: 'Draft' });
      await releaseQuiz(lecturer, draft.id, classId);

      const closed = await createQuiz(lecturer, { title: 'Closed' });
      await releaseQuiz(lecturer, closed.id, classId);
      await setQuizStatus(lecturer, closed.id, 'open', ['draft']);
      await setQuizStatus(lecturer, closed.id, 'closed', ['open']);

      const unreleased = await createQuiz(lecturer, { title: 'Unreleased' });
      await setQuizStatus(lecturer, unreleased.id, 'open', ['draft']);

      const results = await listOpenQuizzesForStudent(classId);
      expect(results).toHaveLength(0);
    });

    it('returns quizzes in a campaign for the class', async () => {
      const { createCampaign, addQuizToCampaign } = await import('../campaigns/campaign.service.js');
      const other = await makeClass(lecturer);
      const quiz = await createQuiz(lecturer, { title: 'Campaign Item' });
      await setQuizStatus(lecturer, quiz.id, 'open', ['draft']);

      const campaign = await createCampaign(lecturer, { class_id: classId, title: 'Series' });
      await addQuizToCampaign(lecturer, campaign.id, quiz.id);

      const results = await listOpenQuizzesForStudent(classId);
      expect(results.map((q) => q.id)).toEqual([quiz.id]);
      expect(results[0].campaign_id).toBe(campaign.id);
      expect(results[0].campaign_title).toBe('Series');

      const otherResults = await listOpenQuizzesForStudent(other.id);
      expect(otherResults).toHaveLength(0);
    });

    it('only counts students of the class', async () => {
      const student = await makeStudent(lecturer, classId);
      const quiz = await makeOpenQuizForClass(lecturer, classId);
      const fetched = await getQuizById(quiz.id);
      expect(fetched.created_by).toBe(lecturer.id);
      expect(student.class_id).toBe(classId);
    });
  });
});

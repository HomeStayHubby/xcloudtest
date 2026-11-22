import { describe, it, expect, beforeEach } from 'vitest';
import {
  createCampaign,
  listCampaignsByClass,
  getCampaignDetail,
  addQuizToCampaign,
  removeQuizFromCampaign,
  reorderPlaylist,
  getCampaignResults,
} from './campaign.service.js';
import { createQuiz, releaseQuiz, setQuizStatus } from '../quizzes/quiz.service.js';
import { createQuestion } from '../questions/question.service.js';
import { createGroup, addGroupMember } from '../groups/group.service.js';
import { submitResponse } from '../responses/response.service.js';
import { setup, makeLecturer, makeClass, makeStudent } from '../../testing/helpers.js';

describe('campaign service', () => {
  let lecturer: Awaited<ReturnType<typeof makeLecturer>>;
  let classId: number;

  beforeEach(async () => {
    await setup();
    lecturer = await makeLecturer();
    classId = (await makeClass(lecturer)).id;
  });

  it('creates and lists campaigns for a class', async () => {
    const campaign = await createCampaign(lecturer, { class_id: classId, title: 'Semester Series' });
    expect(campaign.title).toBe('Semester Series');
    expect(campaign.class_id).toBe(classId);
    expect(campaign.created_by).toBe(lecturer.id);

    const list = await listCampaignsByClass(classId);
    expect(list).toHaveLength(1);
  });

  it('manages the playlist: add, reorder, remove', async () => {
    const campaign = await createCampaign(lecturer, { class_id: classId, title: 'Series' });
    const quizA = await createQuiz(lecturer, { title: 'Quiz A' });
    const quizB = await createQuiz(lecturer, { title: 'Quiz B' });
    const quizC = await createQuiz(lecturer, { title: 'Quiz C' });

    await addQuizToCampaign(lecturer, campaign.id, quizA.id);
    await addQuizToCampaign(lecturer, campaign.id, quizB.id);
    await addQuizToCampaign(lecturer, campaign.id, quizC.id);

    let detail = await getCampaignDetail(campaign.id);
    expect(detail.items.map((item) => item.quiz_id)).toEqual([quizA.id, quizB.id, quizC.id]);

    detail = await reorderPlaylist(campaign.id, [quizC.id, quizA.id, quizB.id]);
    expect(detail.items.map((item) => item.quiz_id)).toEqual([quizC.id, quizA.id, quizB.id]);

    detail = await removeQuizFromCampaign(campaign.id, quizA.id);
    expect(detail.items.map((item) => item.quiz_id)).toEqual([quizC.id, quizB.id]);
  });

  it('rejects duplicate adds, foreign quizzes, and outsiders managing playlists', async () => {
    const outsider = await makeLecturer();
    const campaign = await createCampaign(lecturer, { class_id: classId, title: 'Series' });
    const quiz = await createQuiz(lecturer, { title: 'Quiz A' });
    await addQuizToCampaign(lecturer, campaign.id, quiz.id);

    await expect(addQuizToCampaign(lecturer, campaign.id, quiz.id)).rejects.toThrow(
      'Quiz is already in this campaign'
    );
    const foreign = await createQuiz(outsider, { title: 'Foreign' });
    await expect(addQuizToCampaign(lecturer, campaign.id, foreign.id)).rejects.toThrow(
      'Quiz not found'
    );
    await expect(reorderPlaylist(campaign.id, [foreign.id])).rejects.toThrow(
      'not in this campaign'
    );
  });

  it('cumulates results across playlist quizzes, including plays made before the quiz was added', async () => {
    const alice = await makeStudent(lecturer, classId, 'Alice');
    const bob = await makeStudent(lecturer, classId, 'Bob');

    const quiz = await createQuiz(lecturer, { title: 'Week 1' });
    await releaseQuiz(lecturer, quiz.id, classId);
    const question = await createQuestion(lecturer, quiz.id, {
      type: 'short_answer',
      prompt: '2+2 = ?',
      data: { type: 'short_answer', prompt: '2+2 = ?', accepted_answers: ['4'], case_sensitive: false },
      answer_mode: 'individual',
      points: 2,
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft']);
    await submitResponse(question.id, alice.id, '4');
    await submitResponse(question.id, bob.id, 'wrong');

    const campaign = await createCampaign(lecturer, { class_id: classId, title: 'Series' });
    await addQuizToCampaign(lecturer, campaign.id, quiz.id);

    const results = await getCampaignResults(campaign.id);
    expect(results.individuals).toHaveLength(2);
    expect(results.individuals[0].display_name).toBe('Alice');
    expect(results.individuals[0].total_score).toBe(2);
    expect(results.individuals[1].display_name).toBe('Bob');
    expect(results.individuals[1].total_score).toBe(0);
    expect(results.per_quiz).toHaveLength(1);
    expect(results.per_quiz[0].quiz_title).toBe('Week 1');
    expect(results.per_quiz[0].responses).toBe(2);
    expect(results.per_quiz[0].total_score).toBe(2);
  });

  it('counts quiz-scoped group responses in campaign results', async () => {
    const student = await makeStudent(lecturer, classId, 'Alice');
    const quiz = await createQuiz(lecturer, { title: 'Week 1' });
    await releaseQuiz(lecturer, quiz.id, classId);
    const group = await createGroup(lecturer, quiz.id, { name: 'Team A' });
    await addGroupMember(lecturer, group.id, student.id);

    const question = await createQuestion(lecturer, quiz.id, {
      type: 'mcq_single',
      prompt: '2+2 = ?',
      data: {
        type: 'mcq_single',
        prompt: '2+2 = ?',
        options: [
          { id: 'a', text: '3' },
          { id: 'b', text: '4' },
        ],
        correct_option_id: 'b',
      },
      answer_mode: 'group',
      points: 3,
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft']);
    await submitResponse(question.id, student.id, 'b');

    const campaign = await createCampaign(lecturer, { class_id: classId, title: 'Series' });
    await addQuizToCampaign(lecturer, campaign.id, quiz.id);

    const results = await getCampaignResults(campaign.id);
    expect(results.groups).toHaveLength(1);
    expect(results.groups[0].group_name).toBe('Team A');
    expect(results.groups[0].total_score).toBe(3);
  });

  it('excludes responses from students of other classes', async () => {
    const otherClass = await makeClass(lecturer, 'Other');
    const local = await makeStudent(lecturer, classId, 'Alice');
    const outsider = await makeStudent(lecturer, otherClass.id, 'Mallory');

    // Released to both classes, so both students may legitimately play.
    const quiz = await createQuiz(lecturer, { title: 'Shared Quiz' });
    await releaseQuiz(lecturer, quiz.id, otherClass.id);
    await releaseQuiz(lecturer, quiz.id, classId);
    const question = await createQuestion(lecturer, quiz.id, {
      type: 'short_answer',
      prompt: '2+2 = ?',
      data: { type: 'short_answer', prompt: '2+2 = ?', accepted_answers: ['4'], case_sensitive: false },
      answer_mode: 'individual',
      points: 5,
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft']);
    await submitResponse(question.id, local.id, '4');
    await submitResponse(question.id, outsider.id, '4');

    const campaign = await createCampaign(lecturer, { class_id: classId, title: 'Series' });
    await addQuizToCampaign(lecturer, campaign.id, quiz.id);

    const results = await getCampaignResults(campaign.id);
    expect(results.individuals).toHaveLength(1);
    expect(results.individuals[0].student_id).toBe(local.id);
  });
});

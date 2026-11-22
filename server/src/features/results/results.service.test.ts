import { describe, it, expect, beforeEach } from 'vitest';
import { createGroup, addGroupMember } from '../groups/group.service.js';
import { createQuiz, releaseQuiz, setQuizStatus } from '../quizzes/quiz.service.js';
import { createQuestion } from '../questions/question.service.js';
import { submitResponse } from '../responses/response.service.js';
import { getQuizResults } from './results.service.js';
import { exportQuizResultsToXlsx } from './results.export.js';
import { setup, makeLecturer, makeClass, makeStudent } from '../../testing/helpers.js';

describe('results service', () => {
  let lecturer: Awaited<ReturnType<typeof makeLecturer>>;
  let cls: Awaited<ReturnType<typeof makeClass>>;
  let classId: number;

  beforeEach(async () => {
    await setup();
    lecturer = await makeLecturer();
    cls = await makeClass(lecturer);
    classId = cls.id;
  });

  it('returns summary and responses for a quiz', async () => {
    const student = await makeStudent(lecturer, classId, 'Alice');
    const quiz = await createQuiz(lecturer, { title: 'Results Quiz' });
    await releaseQuiz(lecturer, quiz.id, classId);
    const question = await createQuestion(lecturer, quiz.id, {
      type: 'short_answer',
      prompt: '2+2 = ?',
      data: {
        type: 'short_answer',
        prompt: '2+2 = ?',
        accepted_answers: ['4'],
        case_sensitive: false,
      },
      answer_mode: 'individual',
      points: 2,
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft']);
    await submitResponse(question.id, student.id, '4');

    const results = await getQuizResults(quiz.id);
    expect(results.quiz_title).toBe('Results Quiz');
    expect(results.class_id).toBeNull();
    expect(results.classes).toHaveLength(1);
    expect(results.classes[0].id).toBe(classId);
    expect(results.summary).toHaveLength(1);
    expect(results.summary[0].response_count).toBe(1);
    expect(results.summary[0].average_score).toBe(2);
    expect(results.summary[0].correct_rate).toBe(1);
    expect(results.responses).toHaveLength(1);
    expect(results.responses[0].student_name).toBe('Alice');
    expect(results.responses[0].class_name).toBe(cls.name);
  });

  it('shows quiz-scoped group name for group responses', async () => {
    const student = await makeStudent(lecturer, classId, 'Alice');
    const quiz = await createQuiz(lecturer, { title: 'Group Quiz' });
    await releaseQuiz(lecturer, quiz.id, classId);
    const group = await createGroup(lecturer, quiz.id, { name: 'Team A' });
    await addGroupMember(lecturer, group.id, student.id);

    const question = await createQuestion(lecturer, quiz.id, {
      type: 'mcq_single',
      prompt: 'Pick 4',
      data: {
        type: 'mcq_single',
        prompt: 'Pick 4',
        options: [{ id: 'a', text: '4' }, { id: 'b', text: '5' }],
        correct_option_id: 'a',
      },
      answer_mode: 'group',
      points: 1,
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft']);
    await submitResponse(question.id, student.id, 'a');

    const results = await getQuizResults(quiz.id);
    expect(results.responses[0].group_name).toBe('Team A');
  });

  it('exports results to xlsx buffer', async () => {
    const quiz = await createQuiz(lecturer, { title: 'Empty Quiz' });
    const results = await getQuizResults(quiz.id);
    const buffer = exportQuizResultsToXlsx(results);
    expect(buffer.length).toBeGreaterThan(0);

    const filtered = await getQuizResults(quiz.id, classId);
    const filteredBuffer = exportQuizResultsToXlsx(filtered);
    expect(filteredBuffer.length).toBeGreaterThan(0);
  });

  it('filters results by class when a quiz is released to several', async () => {
    const classB = (await makeClass(lecturer)).id;
    const alice = await makeStudent(lecturer, classId, 'Alice');
    const bob = await makeStudent(lecturer, classB, 'Bob');
    const quiz = await createQuiz(lecturer, { title: 'Multi Class Quiz' });
    await releaseQuiz(lecturer, quiz.id, classId);
    await releaseQuiz(lecturer, quiz.id, classB);
    const question = await createQuestion(lecturer, quiz.id, {
      type: 'short_answer',
      prompt: '2+2 = ?',
      data: {
        type: 'short_answer',
        prompt: '2+2 = ?',
        accepted_answers: ['4'],
        case_sensitive: false,
      },
      answer_mode: 'individual',
      points: 2,
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft']);
    await submitResponse(question.id, alice.id, '4');
    await submitResponse(question.id, bob.id, '4');

    const all = await getQuizResults(quiz.id);
    expect(all.class_id).toBeNull();
    expect(all.classes).toHaveLength(2);
    expect([...all.responses].map((r) => r.student_name).sort()).toEqual(['Alice', 'Bob']);
    expect(all.summary[0].response_count).toBe(2);

    const onlyA = await getQuizResults(quiz.id, classId);
    expect(onlyA.class_id).toBe(classId);
    expect(onlyA.classes).toHaveLength(2);
    expect(onlyA.responses).toHaveLength(1);
    expect(onlyA.responses[0].student_name).toBe('Alice');
    expect(onlyA.responses[0].class_name).toBe(cls.name);
    expect(onlyA.summary[0].response_count).toBe(1);

    const onlyB = await getQuizResults(quiz.id, classB);
    expect(onlyB.responses).toHaveLength(1);
    expect(onlyB.responses[0].student_name).toBe('Bob');
    expect(onlyB.summary[0].response_count).toBe(1);
  });

  it('filters group responses by the responding student\'s class', async () => {
    const classB = (await makeClass(lecturer)).id;
    const alice = await makeStudent(lecturer, classId, 'Alice');
    await makeStudent(lecturer, classB, 'Bob');
    const quiz = await createQuiz(lecturer, { title: 'Group Filter Quiz' });
    await releaseQuiz(lecturer, quiz.id, classId);
    await releaseQuiz(lecturer, quiz.id, classB);
    const group = await createGroup(lecturer, quiz.id, { name: 'Team A' });
    await addGroupMember(lecturer, group.id, alice.id);
    const question = await createQuestion(lecturer, quiz.id, {
      type: 'mcq_single',
      prompt: 'Pick 4',
      data: {
        type: 'mcq_single',
        prompt: 'Pick 4',
        options: [{ id: 'a', text: '4' }, { id: 'b', text: '5' }],
        correct_option_id: 'a',
      },
      answer_mode: 'group',
      points: 1,
    });
    await setQuizStatus(lecturer, quiz.id, 'open', ['draft']);
    await submitResponse(question.id, alice.id, 'a');

    const onlyB = await getQuizResults(quiz.id, classB);
    expect(onlyB.responses).toHaveLength(0);
    expect(onlyB.summary).toHaveLength(0);

    const onlyA = await getQuizResults(quiz.id, classId);
    expect(onlyA.responses).toHaveLength(1);
    expect(onlyA.responses[0].group_name).toBe('Team A');
  });

  it('lists released classes even when there are no responses', async () => {
    const alpha = (await makeClass(lecturer, 'Alpha')).id;
    const beta = (await makeClass(lecturer, 'Beta')).id;
    const quiz = await createQuiz(lecturer, { title: 'Empty Quiz' });
    await releaseQuiz(lecturer, quiz.id, beta);
    await releaseQuiz(lecturer, quiz.id, alpha);

    const results = await getQuizResults(quiz.id);
    expect(results.class_id).toBeNull();
    expect(results.classes.map((c) => c.name)).toEqual(['Alpha', 'Beta']);
    expect(results.summary).toHaveLength(0);
    expect(results.responses).toHaveLength(0);
  });
});

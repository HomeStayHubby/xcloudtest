import { describe, it, expect, beforeEach } from 'vitest';
import {
  createQuestion,
  listQuestionsByQuiz,
  updateQuestion,
  deleteQuestion,
  createBankQuestion,
  copyBankQuestionToQuiz,
  getQuestionById,
} from './question.service.js';
import { createQuiz } from '../quizzes/quiz.service.js';
import { createBank } from '../question-banks/question-bank.service.js';
import { setup, makeLecturer, makeClass, uniqueId } from '../../testing/helpers.js';

const MCQ_DATA = (prompt: string) => ({
  type: 'mcq_single' as const,
  prompt,
  options: [
    { id: 'a', text: '3' },
    { id: 'b', text: '4' },
  ],
  correct_option_id: 'b',
});

describe('question service', () => {
  let lecturer: Awaited<ReturnType<typeof makeLecturer>>;
  let quizId: number;

  beforeEach(async () => {
    await setup();
    lecturer = await makeLecturer();
    quizId = (await createQuiz(lecturer, { title: 'Quiz' })).id;
  });

  it('creates a multiple-choice question', async () => {
    const question = await createQuestion(lecturer, quizId, {
      type: 'mcq_single',
      prompt: 'What is 2+2?',
      data: MCQ_DATA('What is 2+2?'),
      answer_mode: 'individual',
      points: 1,
    });
    expect(question.prompt).toBe('What is 2+2?');
    expect(question.data.type).toBe('mcq_single');
    expect(question.quiz_id).toBe(quizId);
    expect(question.bank_id ?? null).toBeNull();
  });

  it('lists questions by quiz (owner only)', async () => {
    await createQuestion(lecturer, quizId, {
      type: 'short_answer',
      prompt: 'Name the capital of France.',
      data: {
        type: 'short_answer',
        prompt: 'Name the capital of France.',
        accepted_answers: ['Paris'],
        case_sensitive: false,
      },
      answer_mode: 'individual',
      points: 1,
    });
    const questions = await listQuestionsByQuiz(lecturer, quizId);
    expect(questions).toHaveLength(1);

    const outsider = await makeLecturer();
    await expect(listQuestionsByQuiz(outsider, quizId)).rejects.toThrow('Quiz not found');
  });

  it('persists per-question time limits', async () => {
    const question = await createQuestion(lecturer, quizId, {
      type: 'short_answer',
      prompt: 'Quick!',
      data: {
        type: 'short_answer',
        prompt: 'Quick!',
        accepted_answers: ['a'],
        case_sensitive: false,
      },
      answer_mode: 'individual',
      points: 1,
      time_limit_seconds: 30,
    });
    expect(question.time_limit_seconds).toBe(30);

    const updated = await updateQuestion(lecturer, question.id, { time_limit_seconds: 45 });
    expect(updated.time_limit_seconds).toBe(45);

    const cleared = await updateQuestion(lecturer, question.id, { time_limit_seconds: null });
    expect(cleared.time_limit_seconds).toBeNull();
  });

  it('blocks editing or deleting other lecturers questions', async () => {
    const outsider = await makeLecturer();
    const question = await createQuestion(lecturer, quizId, {
      type: 'short_answer',
      prompt: 'x',
      data: { type: 'short_answer', prompt: 'x', accepted_answers: ['x'], case_sensitive: false },
      answer_mode: 'individual',
      points: 1,
    });
    await expect(updateQuestion(outsider, question.id, { prompt: 'hax' })).rejects.toThrow(
      'Quiz not found'
    );
    await expect(deleteQuestion(outsider, question.id)).rejects.toThrow('Quiz not found');
  });

  describe('question banks', () => {
    it('creates bank questions without a quiz', async () => {
      const bank = await createBank(lecturer, { title: `Bank ${uniqueId('B')}` });
      const bankQuestion = await createBankQuestion(lecturer, bank.id, {
        type: 'mcq_single',
        prompt: 'Bank question',
        data: MCQ_DATA('Bank question'),
        points: 2,
      });
      expect(bankQuestion.quiz_id ?? null).toBeNull();
      expect(bankQuestion.bank_id).toBe(bank.id);
    });

    it('snapshot-copies a bank question into a quiz', async () => {
      const bank = await createBank(lecturer, { title: `Bank ${uniqueId('B')}` });
      const source = await createBankQuestion(lecturer, bank.id, {
        type: 'mcq_single',
        prompt: 'Original',
        data: MCQ_DATA('Original'),
        points: 3,
      });

      const copy = await copyBankQuestionToQuiz(lecturer, bank.id, source.id, quizId);
      expect(copy.quiz_id).toBe(quizId);
      expect(copy.bank_id ?? null).toBeNull();
      expect(copy.id).not.toBe(source.id);
      expect(copy.prompt).toBe('Original');
      expect(copy.points).toBe(3);

      // Editing the original does not change the copy.
      await updateQuestion(lecturer, source.id, { prompt: 'Changed in bank' });
      const fetchedCopy = await getQuestionById(copy.id);
      expect(fetchedCopy.prompt).toBe('Original');
    });

    it('rejects copying from a bank the lecturer does not own', async () => {
      const owner = await makeLecturer();
      const bank = await createBank(owner, { title: 'Foreign bank' });
      const source = await createBankQuestion(owner, bank.id, {
        type: 'short_answer',
        prompt: 'Secret',
        data: { type: 'short_answer', prompt: 'Secret', accepted_answers: ['x'], case_sensitive: false },
        points: 1,
      });

      await expect(copyBankQuestionToQuiz(lecturer, bank.id, source.id, quizId)).rejects.toThrow(
        'do not own'
      );
    });

    it('rejects copying a non-bank question id', async () => {
      const bank = await createBank(lecturer, { title: 'Empty bank' });
      const quizQuestion = await createQuestion(lecturer, quizId, {
        type: 'short_answer',
        prompt: 'Quiz q',
        data: { type: 'short_answer', prompt: 'Quiz q', accepted_answers: ['x'], case_sensitive: false },
        points: 1,
      });
      await expect(
        copyBankQuestionToQuiz(lecturer, bank.id, quizQuestion.id, quizId)
      ).rejects.toThrow('Bank question not found');
    });
  });

  describe('bloom level', () => {
    it('persists bloom_level on create, update, and clear', async () => {
      const created = await createQuestion(lecturer, quizId, {
        type: 'mcq_single',
        prompt: 'Bloomed',
        data: MCQ_DATA('Bloomed'),
        points: 1,
        bloom_level: 'apply',
      });
      expect(created.bloom_level).toBe('apply');

      const updated = await updateQuestion(lecturer, created.id, { bloom_level: 'understand' });
      expect(updated.bloom_level).toBe('understand');

      const cleared = await updateQuestion(lecturer, created.id, { bloom_level: null });
      expect(cleared.bloom_level ?? null).toBeNull();
    });

    it('defaults to no bloom level and copies it with bank questions', async () => {
      const plain = await createQuestion(lecturer, quizId, {
        type: 'short_answer',
        prompt: 'No bloom',
        data: { type: 'short_answer', prompt: 'No bloom', accepted_answers: ['x'], case_sensitive: false },
        points: 1,
      });
      expect(plain.bloom_level ?? null).toBeNull();

      const bank = await createBank(lecturer, { title: `Bank ${uniqueId('B')}` });
      const source = await createBankQuestion(lecturer, bank.id, {
        type: 'mcq_single',
        prompt: 'Tagged bank q',
        data: MCQ_DATA('Tagged bank q'),
        points: 1,
        bloom_level: 'remember',
      });

      const copy = await copyBankQuestionToQuiz(lecturer, bank.id, source.id, quizId);
      expect(copy.bloom_level).toBe('remember');
    });

    it('rejects invalid bloom levels', async () => {
      await expect(
        createQuestion(lecturer, quizId, {
          type: 'short_answer',
          prompt: 'Bad bloom',
          data: { type: 'short_answer', prompt: 'Bad bloom', accepted_answers: ['x'], case_sensitive: false },
          points: 1,
          // @ts-expect-error exercising runtime validation of the enum
          bloom_level: 'analyze',
        })
      ).rejects.toThrow();
    });
  });
});

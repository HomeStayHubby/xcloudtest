import { describe, it, expect, beforeEach } from 'vitest';
import { submitResponse, setResponseScore, setQuestionScores, getResponseById } from './response.service.js';
import { createGroup, addGroupMember } from '../groups/group.service.js';
import {
  setup,
  makeLecturer,
  makeClass,
  makeStudent,
  makeOpenQuizForClass,
  uniqueId,
} from '../../testing/helpers.js';
import { createQuestion } from '../questions/question.service.js';
import { setQuizStatus } from '../quizzes/quiz.service.js';
import { setCurrentQuestionIndex } from '../live/pacing.service.js';
import { getQuizScoreboard } from '../live/scoreboard.service.js';
import { manualScoreSchema } from './response.validators.js';

describe('response service', () => {
  let lecturer: Awaited<ReturnType<typeof makeLecturer>>;
  let classId: number;

  beforeEach(async () => {
    await setup();
    lecturer = await makeLecturer();
    classId = (await makeClass(lecturer)).id;
  });

  function mcqData(prompt: string, correct: string) {
    return {
      type: 'mcq_single' as const,
      prompt,
      options: [
        { id: 'a', text: '4' },
        { id: 'b', text: '5' },
      ],
      correct_option_id: correct,
    };
  }

  it('submits and automarks a correct MCQ response', async () => {
    const student = await makeStudent(lecturer, classId, 'Alice');
    const quiz = await makeOpenQuizForClass(lecturer, classId, 'Math Quiz');
    const question = await createQuestion(lecturer, quiz.id, {
      type: 'mcq_single',
      prompt: '2+2?',
      data: mcqData('2+2?', 'a'),
      answer_mode: 'individual',
      points: 1,
    });

    const response = await submitResponse(question.id, student.id, 'a');
    expect(response.score).toBe(1);
    expect(response.student_id).toBe(student.id);
  });

  it('rejects students whose class the quiz is not released to', async () => {
    const otherClass = await makeClass(lecturer);
    const outsider = await makeStudent(lecturer, otherClass.id, 'Bob');
    const quiz = await makeOpenQuizForClass(lecturer, classId, 'Not For Bob');
    const question = await createQuestion(lecturer, quiz.id, {
      type: 'short_answer',
      prompt: 'Capital',
      data: { type: 'short_answer', prompt: 'Capital', accepted_answers: ['Berlin'], case_sensitive: false },
      answer_mode: 'individual',
      points: 1,
    });

    await expect(submitResponse(question.id, outsider.id, 'Berlin')).rejects.toThrow(
      'has not been released to your class'
    );
  });

  it('rejects submission when quiz is not open', async () => {
    const student = await makeStudent(lecturer, classId, 'Alice');
    const quiz = await makeOpenQuizForClass(lecturer, classId, 'To Close');
    const question = await createQuestion(lecturer, quiz.id, {
      type: 'short_answer',
      prompt: 'Capital',
      data: { type: 'short_answer', prompt: 'Capital', accepted_answers: ['Berlin'], case_sensitive: false },
      answer_mode: 'individual',
      points: 1,
    });
    await setQuizStatus(lecturer, quiz.id, 'closed', ['open']);

    await expect(submitResponse(question.id, student.id, 'Berlin')).rejects.toThrow(
      'Quiz is not open'
    );
  });

  it('resolves the quiz-scoped group for group answers', async () => {
    const student = await makeStudent(lecturer, classId, 'Alice');
    const quiz = await makeOpenQuizForClass(lecturer, classId, 'Team Quiz');
    const quizGroup = await createGroup(lecturer, quiz.id, { name: `Team ${uniqueId('T')}` });
    await addGroupMember(lecturer, quizGroup.id, student.id);

    const question = await createQuestion(lecturer, quiz.id, {
      type: 'mcq_single',
      prompt: 'Pick 4',
      data: mcqData('Pick 4', 'b'),
      answer_mode: 'group',
      points: 2,
    });

    const response = await submitResponse(question.id, student.id, 'b');
    expect(response.group_id).toBe(quizGroup.id);
    expect(response.score).toBe(2);
  });

  it('rejects group-mode response for a student without a group', async () => {
    const student = await makeStudent(lecturer, classId, 'Solo');
    const quiz = await makeOpenQuizForClass(lecturer, classId, 'Team Quiz');
    const question = await createQuestion(lecturer, quiz.id, {
      type: 'short_answer',
      prompt: 'Capital',
      data: { type: 'short_answer', prompt: 'Capital', accepted_answers: ['Berlin'], case_sensitive: false },
      answer_mode: 'group',
      points: 1,
    });

    await expect(submitResponse(question.id, student.id, 'Berlin')).rejects.toThrow(
      'Group membership required'
    );
  });

  it('blocks scored resubmission but allows re-submitting unscored ones', async () => {
    const student = await makeStudent(lecturer, classId, 'Alice');
    const quiz = await makeOpenQuizForClass(lecturer, classId, 'Resubmit');
    const scored = await createQuestion(lecturer, quiz.id, {
      type: 'mcq_single',
      prompt: '2+2?',
      data: mcqData('2+2?', 'a'),
      answer_mode: 'individual',
      points: 1,
    });
    const cloud = await createQuestion(lecturer, quiz.id, {
      type: 'word_cloud',
      prompt: 'One word about today',
      data: { type: 'word_cloud', prompt: 'One word about today', max_words_per_student: 3 },
      answer_mode: 'individual',
      points: 1,
    });

    await submitResponse(scored.id, student.id, 'a');
    await expect(submitResponse(scored.id, student.id, 'b')).rejects.toThrow(
      'already submitted'
    );

    const first = await submitResponse(cloud.id, student.id, ['fun']);
    const second = await submitResponse(cloud.id, student.id, ['boring']);
    expect(second.id).not.toBe(first.id);
  });

  it('adds sprint bonus for fast answers in a paced quiz', async () => {
    const student = await makeStudent(lecturer, classId, 'Alice');
    const quiz = await makeOpenQuizForClass(lecturer, classId, 'Sprint Quiz');
    const question = await createQuestion(lecturer, quiz.id, {
      type: 'mcq_single',
      prompt: '2+2?',
      data: mcqData('2+2?', 'a'),
      answer_mode: 'individual',
      points: 4,
      time_limit_seconds: 60,
    });
    await setQuizStatus(lecturer, quiz.id, 'closed', ['open']);
    await setQuizStatus(lecturer, quiz.id, 'open', ['closed']);
    setCurrentQuestionIndex(quiz.id, 0);

    const response = await submitResponse(question.id, student.id, 'a');
    expect(response.score).toBeGreaterThanOrEqual(4);
    expect(response.score).toBeLessThanOrEqual(5);
  });

  describe('manual scoring for word_cloud / brainstorming', () => {
    function cloudData(prompt: string) {
      return { type: 'word_cloud' as const, prompt, max_words_per_student: 3 };
    }

    function brainstormData(prompt: string) {
      return { type: 'brainstorming' as const, prompt, allow_upvotes: true };
    }

    it('scores a single word_cloud response and updates the scoreboard', async () => {
      const student = await makeStudent(lecturer, classId, 'Alice');
      const quiz = await makeOpenQuizForClass(lecturer, classId, 'Cloud Quiz');
      const question = await createQuestion(lecturer, quiz.id, {
        type: 'word_cloud',
        prompt: 'One word about today',
        data: cloudData('One word about today'),
        answer_mode: 'individual',
        points: 0,
      });

      const response = await submitResponse(question.id, student.id, ['fun']);
      expect(response.score).toBeNull();

      const scored = await setResponseScore(lecturer, response.id, 2.5);
      expect(scored.score).toBe(2.5);

      const scoreboard = await getQuizScoreboard(quiz.id);
      expect(scoreboard.individuals[0].total_score).toBe(2.5);
    });

    it('scores all submissions for a brainstorming question at once', async () => {
      const alice = await makeStudent(lecturer, classId, 'Alice');
      const bob = await makeStudent(lecturer, classId, 'Bob');
      const quiz = await makeOpenQuizForClass(lecturer, classId, 'Idea Quiz');
      const question = await createQuestion(lecturer, quiz.id, {
        type: 'brainstorming',
        prompt: 'Ideas for the field trip',
        data: brainstormData('Ideas for the field trip'),
        answer_mode: 'individual',
        points: 0,
      });

      const first = await submitResponse(question.id, alice.id, ['museum']);
      const second = await submitResponse(question.id, bob.id, ['zoo']);

      const result = await setQuestionScores(lecturer, question.id, 3);
      expect(result.updated).toBe(2);

      expect((await getResponseById(first.id)).score).toBe(3);
      expect((await getResponseById(second.id)).score).toBe(3);

      const scoreboard = await getQuizScoreboard(quiz.id);
      const total = scoreboard.individuals.reduce((sum, entry) => sum + entry.total_score, 0);
      expect(total).toBe(6);
    });

    it('rejects a lecturer who does not own the quiz', async () => {
      const otherLecturer = await makeLecturer(false, `Other ${uniqueId('L')}`);
      const student = await makeStudent(lecturer, classId, 'Alice');
      const quiz = await makeOpenQuizForClass(lecturer, classId, 'Owned Quiz');
      const question = await createQuestion(lecturer, quiz.id, {
        type: 'word_cloud',
        prompt: 'One word',
        data: cloudData('One word'),
        answer_mode: 'individual',
        points: 0,
      });
      const response = await submitResponse(question.id, student.id, ['fun']);

      await expect(setResponseScore(otherLecturer, response.id, 2)).rejects.toThrow(
        'Quiz not found'
      );
      await expect(setQuestionScores(otherLecturer, question.id, 2)).rejects.toThrow(
        'Quiz not found'
      );
    });

    it('rejects manual scoring of auto-scored question types', async () => {
      const student = await makeStudent(lecturer, classId, 'Alice');
      const quiz = await makeOpenQuizForClass(lecturer, classId, 'Auto Quiz');
      const question = await createQuestion(lecturer, quiz.id, {
        type: 'mcq_single',
        prompt: '2+2?',
        data: mcqData('2+2?', 'a'),
        answer_mode: 'individual',
        points: 1,
      });
      const response = await submitResponse(question.id, student.id, 'a');

      await expect(setResponseScore(lecturer, response.id, 2)).rejects.toThrow(
        'Only word cloud and brainstorming'
      );
      await expect(setQuestionScores(lecturer, question.id, 2)).rejects.toThrow(
        'Only word cloud and brainstorming'
      );
    });

    it('resets the score when a student resubmits while the quiz is open', async () => {
      const student = await makeStudent(lecturer, classId, 'Alice');
      const quiz = await makeOpenQuizForClass(lecturer, classId, 'Resubmit Reset');
      const question = await createQuestion(lecturer, quiz.id, {
        type: 'word_cloud',
        prompt: 'One word',
        data: cloudData('One word'),
        answer_mode: 'individual',
        points: 0,
      });

      const first = await submitResponse(question.id, student.id, ['fun']);
      await setResponseScore(lecturer, first.id, 2);
      expect((await getResponseById(first.id)).score).toBe(2);

      const second = await submitResponse(question.id, student.id, ['boring']);
      expect(second.id).not.toBe(first.id);
      expect(second.score).toBeNull();
    });

    it('validates the score payload', () => {
      expect(manualScoreSchema.safeParse({ score: 2.5 }).success).toBe(true);
      expect(manualScoreSchema.safeParse({ score: 0 }).success).toBe(true);
      expect(manualScoreSchema.safeParse({ score: -1 }).success).toBe(false);
      expect(manualScoreSchema.safeParse({}).success).toBe(false);
    });
  });
});

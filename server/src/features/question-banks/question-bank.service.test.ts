import { describe, it, expect, beforeEach } from 'vitest';
import {
  listBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  listBankQuestions,
} from './question-bank.service.js';
import { setup, makeLecturer, uniqueId } from '../../testing/helpers.js';

describe('question bank service', () => {
  let lecturer: Awaited<ReturnType<typeof makeLecturer>>;

  beforeEach(async () => {
    await setup();
    lecturer = await makeLecturer();
  });

  it('creates banks owned by the lecturer', async () => {
    const bank = await createBank(lecturer, { title: `Bank ${uniqueId('B')}`, description: 'Reusable' });
    expect(bank.owner_id).toBe(lecturer.id);
    expect(bank.question_count).toBe(0);

    const banks = await listBanks(lecturer);
    expect(banks.map((b) => b.id)).toContain(bank.id);
    expect(banks[0].owner_name).toBe(lecturer.display_name);
  });

  it('hides other lecturers banks, but admins see all', async () => {
    const owner = await makeLecturer();
    const bank = await createBank(owner, { title: 'Private bank' });

    await expect(getBank(lecturer, bank.id)).rejects.toThrow('do not own');
    const foreignList = await listBanks(lecturer);
    expect(foreignList.map((b) => b.id)).not.toContain(bank.id);

    const admin = await makeLecturer(true);
    const adminList = await listBanks(admin);
    expect(adminList.map((b) => b.id)).toContain(bank.id);
    await expect(getBank(admin, bank.id)).resolves.toBeTruthy();
  });

  it('updates and deletes banks', async () => {
    const bank = await createBank(lecturer, { title: 'Draft' });
    const updated = await updateBank(lecturer, bank.id, { title: 'Final' });
    expect(updated.title).toBe('Final');

    await deleteBank(lecturer, bank.id);
    await expect(getBank(lecturer, bank.id)).rejects.toThrow('Question bank not found');
  });

  it('tracks question_count per bank', async () => {
    const { createBankQuestion } = await import('../questions/question.service.js');
    const bank = await createBank(lecturer, { title: 'Counted' });
    await createBankQuestion(lecturer, bank.id, {
      type: 'short_answer',
      prompt: 'q',
      data: { type: 'short_answer', prompt: 'q', accepted_answers: ['a'], case_sensitive: false },
      points: 1,
    });
    const refreshed = await getBank(lecturer, bank.id);
    expect(refreshed.question_count).toBe(1);
    const questions = await listBankQuestions(lecturer, bank.id) as { prompt: string }[];
    expect(questions).toHaveLength(1);
  });
});

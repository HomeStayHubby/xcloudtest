import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { forbidden, notFound } from '../../shared/errors.js';
import type { Actor } from '../../shared/permissions.js';
import { isAdminUser } from '../../shared/permissions.js';
import type { QuestionBank, QuestionBankDetail } from '@elitequest/shared';

type BankRow = QuestionBank & { owner_name?: string; question_count?: number };

function mapBank(row: BankRow): QuestionBankDetail {
  return {
    id: row.id,
    owner_id: row.owner_id,
    title: row.title,
    description: row.description,
    owner_name: row.owner_name,
    question_count: row.question_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listBanks(user: Actor): Promise<QuestionBankDetail[]> {
  const where = isAdminUser(user) ? '' : 'WHERE b.owner_id = ?';
  const params: unknown[] = isAdminUser(user) ? [] : [user.id];
  const rows = await allAsync<BankRow>(
    database,
    `SELECT b.*, u.display_name AS owner_name,
            (SELECT COUNT(*) FROM questions q WHERE q.bank_id = b.id) AS question_count
     FROM question_banks b
     LEFT JOIN users u ON u.id = b.owner_id
     ${where}
     ORDER BY b.created_at DESC, b.id DESC`,
    ...params
  );
  return rows.map(mapBank);
}

export async function getBank(user: Actor, id: number): Promise<QuestionBankDetail> {
  const row = await getAsync<BankRow>(
    database,
    `SELECT b.*, u.display_name AS owner_name,
            (SELECT COUNT(*) FROM questions q WHERE q.bank_id = b.id) AS question_count
     FROM question_banks b
     LEFT JOIN users u ON u.id = b.owner_id
     WHERE b.id = ?`,
    id
  );
  if (!row) {
    throw notFound('Question bank');
  }
  if (!isAdminUser(user) && row.owner_id !== user.id) {
    throw forbidden('You do not own this question bank');
  }
  return mapBank(row);
}

export async function createBank(
  user: Actor,
  input: { title: string; description?: string }
): Promise<QuestionBankDetail> {
  await runAsync(
    database,
    'INSERT INTO question_banks (owner_id, title, description) VALUES (?, ?, ?)',
    user.id,
    input.title,
    input.description ?? null
  );
  const row = await getAsync<{ id: number }>(
    database,
    'SELECT id FROM question_banks WHERE owner_id = ? ORDER BY id DESC LIMIT 1',
    user.id
  );
  if (!row) {
    throw new Error('Failed to create question bank');
  }
  return getBank(user, row.id);
}

export async function updateBank(
  user: Actor,
  id: number,
  input: { title?: string; description?: string }
): Promise<QuestionBankDetail> {
  const existing = await getBank(user, id);
  await runAsync(
    database,
    'UPDATE question_banks SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    input.title ?? existing.title,
    input.description ?? existing.description ?? null,
    id
  );
  return getBank(user, id);
}

export async function deleteBank(user: Actor, id: number): Promise<void> {
  await getBank(user, id);
  await runAsync(database, 'DELETE FROM question_banks WHERE id = ?', id);
}

export async function listBankQuestions(user: Actor, bankId: number) {
  await getBank(user, bankId);
  return allAsync(
    database,
    'SELECT * FROM questions WHERE bank_id = ? ORDER BY created_at, id',
    bankId
  );
}

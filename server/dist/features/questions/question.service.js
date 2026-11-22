import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { notFound } from '../../shared/errors.js';
import { assertQuizOwner } from '../quizzes/quiz.service.js';
import { getBank } from '../question-banks/question-bank.service.js';
import { parseQuestionData, stringifyQuestionData } from '../../db/json-helpers.js';
import { createQuestionSchema, updateQuestionSchema } from '@elitequest/shared';
function parseQuestionRow(row) {
    return {
        ...row,
        data: parseQuestionData(row.data),
    };
}
export async function listQuestionsByQuiz(user, quizId) {
    await assertQuizOwner(user, quizId);
    return listQuestionsRawByQuiz(quizId);
}
// No ownership check — callers enforce access (e.g. sanitized student play).
export async function listQuestionsRawByQuiz(quizId) {
    const rows = await allAsync(database, 'SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index, id', quizId);
    return rows.map(parseQuestionRow);
}
export async function getQuestionById(id) {
    const row = await getAsync(database, 'SELECT * FROM questions WHERE id = ?', id);
    if (!row) {
        throw notFound('Question');
    }
    return parseQuestionRow(row);
}
async function getNextOrderIndex(quizId) {
    const row = await getAsync(database, 'SELECT MAX(order_index) as max_index FROM questions WHERE quiz_id = ?', quizId);
    return (row?.max_index ?? -1) + 1;
}
export async function createQuestion(user, quizId, input) {
    await assertQuizOwner(user, quizId);
    const normalized = createQuestionSchema.parse(input);
    const orderIndex = normalized.order_index ?? (await getNextOrderIndex(quizId));
    const dataString = stringifyQuestionData(normalized.data);
    await runAsync(database, 'INSERT INTO questions (quiz_id, bank_id, order_index, type, prompt, data, answer_mode, points, time_limit_seconds, bloom_level) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)', quizId, orderIndex, normalized.type, normalized.prompt, dataString, normalized.answer_mode, normalized.points, normalized.time_limit_seconds ?? null, normalized.bloom_level ?? null);
    const created = await getAsync(database, 'SELECT last_insert_rowid() as id');
    if (!created) {
        throw new Error('Failed to create question');
    }
    return getQuestionById(created.id);
}
// Snapshot-copies a bank question into a quiz. The quiz gets its own row so
// later bank edits never alter the quiz.
export async function copyBankQuestionToQuiz(user, bankId, bankQuestionId, quizId) {
    const bank = await getBank(user, bankId);
    const source = await getAsync(database, 'SELECT * FROM questions WHERE id = ? AND bank_id = ?', bankQuestionId, bank.id);
    if (!source) {
        throw notFound('Bank question');
    }
    await assertQuizOwner(user, quizId);
    const orderIndex = await getNextOrderIndex(quizId);
    await runAsync(database, 'INSERT INTO questions (quiz_id, bank_id, order_index, type, prompt, data, answer_mode, points, time_limit_seconds, bloom_level) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)', quizId, orderIndex, source.type, source.prompt, source.data, source.answer_mode, source.points, source.time_limit_seconds ?? null, source.bloom_level ?? null);
    const created = await getAsync(database, 'SELECT last_insert_rowid() as id');
    if (!created) {
        throw new Error('Failed to copy bank question');
    }
    return getQuestionById(created.id);
}
export async function updateQuestion(user, id, input) {
    const existing = await getQuestionById(id);
    if (existing.quiz_id) {
        await assertQuizOwner(user, existing.quiz_id);
    }
    else if (existing.bank_id) {
        await getBank(user, existing.bank_id);
    }
    else {
        throw notFound('Question');
    }
    const prompt = input.prompt ?? existing.prompt;
    const parsedData = input.data !== undefined ? updateQuestionSchema.parse(input).data : undefined;
    const data = parsedData !== undefined ? stringifyQuestionData(parsedData) : stringifyQuestionData(existing.data);
    const answerMode = input.answer_mode ?? existing.answer_mode;
    const points = input.points ?? existing.points;
    const orderIndex = input.order_index ?? existing.order_index;
    const timeLimit = input.time_limit_seconds !== undefined ? input.time_limit_seconds : (existing.time_limit_seconds ?? null);
    const bloomLevel = input.bloom_level !== undefined ? input.bloom_level : (existing.bloom_level ?? null);
    await runAsync(database, 'UPDATE questions SET order_index = ?, prompt = ?, data = ?, answer_mode = ?, points = ?, time_limit_seconds = ?, bloom_level = ? WHERE id = ?', orderIndex, prompt, data, answerMode, points, timeLimit ?? null, bloomLevel ?? null, id);
    return getQuestionById(id);
}
export async function deleteQuestion(user, id) {
    const existing = await getQuestionById(id);
    if (existing.quiz_id) {
        await assertQuizOwner(user, existing.quiz_id);
    }
    else if (existing.bank_id) {
        await getBank(user, existing.bank_id);
    }
    else {
        throw notFound('Question');
    }
    await runAsync(database, 'DELETE FROM questions WHERE id = ?', id);
}
export async function createBankQuestion(user, bankId, input) {
    await getBank(user, bankId);
    const normalized = createQuestionSchema.parse(input);
    const dataString = stringifyQuestionData(normalized.data);
    await runAsync(database, 'INSERT INTO questions (quiz_id, bank_id, order_index, type, prompt, data, answer_mode, points, time_limit_seconds, bloom_level) VALUES (NULL, ?, 0, ?, ?, ?, ?, ?, ?, ?)', bankId, normalized.type, normalized.prompt, dataString, normalized.answer_mode, normalized.points, normalized.time_limit_seconds ?? null, normalized.bloom_level ?? null);
    const created = await getAsync(database, 'SELECT last_insert_rowid() as id');
    if (!created) {
        throw new Error('Failed to create bank question');
    }
    return getQuestionById(created.id);
}
//# sourceMappingURL=question.service.js.map
import { database } from '../../db/database.js';
import { allAsync, getAsync, runAsync } from '../../db/promises.js';
import { getQuestionById } from '../questions/question.service.js';
export async function getAggregationsByQuestion(questionId) {
    const question = await getQuestionById(questionId);
    if (question.type === 'word_cloud') {
        const rows = await allAsync(database, 'SELECT answer, author FROM v_response_author WHERE question_id = ?', questionId);
        const byWord = new Map();
        for (const row of rows) {
            const words = parseAnswer(row.answer);
            for (const word of words) {
                const normalized = word.trim().toLowerCase();
                if (!normalized)
                    continue;
                const entry = byWord.get(normalized) ?? { count: 0, submitters: new Set() };
                entry.count++;
                entry.submitters.add(row.author ?? 'Anonymous');
                byWord.set(normalized, entry);
            }
        }
        const words = [...byWord.entries()].map(([word, meta]) => ({
            word,
            count: meta.count,
            submitters: [...meta.submitters],
        }));
        words.sort((a, b) => b.count - a.count);
        return { type: 'word_cloud', words };
    }
    if (question.type === 'brainstorming') {
        const rows = await allAsync(database, 'SELECT answer, author FROM v_response_author WHERE question_id = ?', questionId);
        const ideas = new Map();
        for (const row of rows) {
            const list = parseAnswer(row.answer);
            for (const idea of list) {
                const normalized = idea.trim();
                if (!normalized)
                    continue;
                const [text, upvoteStr = '0'] = normalized.split('|');
                const cleanIdea = text.trim();
                if (!cleanIdea)
                    continue;
                const existing = ideas.get(cleanIdea);
                if (existing) {
                    existing.count++;
                    existing.upvotes += Number(upvoteStr) || 0;
                    if (row.author)
                        existing.submitters.push(row.author);
                }
                else {
                    ideas.set(cleanIdea, {
                        idea: cleanIdea,
                        count: 1,
                        upvotes: Number(upvoteStr) || 0,
                        submitters: row.author ? [row.author] : [],
                    });
                }
            }
        }
        const sorted = [...ideas.values()].sort((a, b) => b.upvotes - a.upvotes || b.count - a.count);
        return { type: 'brainstorming', ideas: sorted };
    }
    return { type: 'none' };
}
function parseAnswer(raw) {
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed))
            return parsed;
        if (typeof parsed === 'string')
            return [parsed];
        return [];
    }
    catch {
        return [];
    }
}
export async function upvoteBrainstormIdea(questionId, studentId, groupId, idea) {
    const question = await getQuestionById(questionId);
    if (question.type !== 'brainstorming') {
        throw new Error('Question is not a brainstorming question');
    }
    if (!studentId && !groupId) {
        throw new Error('Upvote requires a student or group context');
    }
    const normalizedIdea = idea.trim().toLowerCase();
    const existing = await getAsync(database, 'SELECT id FROM brainstorm_upvotes WHERE question_id = ? AND idea = ? AND ((student_id = ?) OR (group_id = ?))', questionId, normalizedIdea, studentId ?? null, groupId ?? null);
    if (existing) {
        throw new Error('You have already upvoted this idea');
    }
    const rows = await allAsync(database, 'SELECT id, answer FROM responses WHERE question_id = ?', questionId);
    let found = false;
    for (const row of rows) {
        const list = parseAnswer(row.answer);
        const index = list.findIndex((item) => item.trim().toLowerCase() === normalizedIdea);
        if (index >= 0) {
            const [text, upvoteStr = '0'] = list[index].split('|');
            const newUpvotes = Number(upvoteStr) + 1;
            list[index] = `${text.trim()}|${newUpvotes}`;
            await runAsync(database, 'UPDATE responses SET answer = ? WHERE id = ?', JSON.stringify(list), row.id);
            found = true;
            break;
        }
    }
    if (found) {
        await runAsync(database, 'INSERT INTO brainstorm_upvotes (question_id, student_id, group_id, idea) VALUES (?, ?, ?, ?)', questionId, studentId ?? null, groupId ?? null, normalizedIdea);
    }
    return getAggregationsByQuestion(questionId);
}
//# sourceMappingURL=aggregation.service.js.map
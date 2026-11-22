import JSZip from 'jszip';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import * as XLSX from 'xlsx';
import { candidateQuestionSchema, generateQuestionsResponseSchema, } from '@elitequest/shared';
import { AppError, badRequest } from '../../shared/errors.js';
import { resolveGroqCredentials } from '../settings/settings.service.js';
import { DEFAULT_GROQ_MODEL, GROQ_BASE_URL, } from './ai-generation.types.js';
const MAX_MATERIAL_CHARS = 100000;
const GENERATION_TIMEOUT_MS = 90000;
const MAX_COMPLETION_TOKENS = 8192;
// ------------------------------------------------------- material extraction
function decodeXmlEntities(input) {
    return input
        .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(Number(dec)))
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}
async function extractPptxText(buffer) {
    const zip = await JSZip.loadAsync(buffer);
    const slideNames = Object.keys(zip.files)
        .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
        .sort((a, b) => Number(a.match(/slide(\d+)\.xml/)?.[1] ?? 0) - Number(b.match(/slide(\d+)\.xml/)?.[1] ?? 0));
    const slideTexts = [];
    for (const name of slideNames) {
        const xml = await zip.files[name].async('string');
        const runs = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => decodeXmlEntities(m[1]).trim());
        const text = runs.filter(Boolean).join(' ').trim();
        if (text.length > 0) {
            slideTexts.push(text);
        }
    }
    return slideTexts.join('\n\n');
}
// Cheap binary sniff: real text files contain no NUL bytes and decode as
// UTF-8 almost cleanly. Catches zip/image/exe payloads and UTF-16 text
// (Notepad "Unicode") before that garbage reaches the AI prompt.
function looksLikeBinary(buffer) {
    const sample = buffer.subarray(0, 8192);
    if (sample.includes(0)) {
        return true;
    }
    const text = sample.toString('utf8');
    const replacements = (text.match(/\uFFFD/g) ?? []).length;
    return replacements > text.length * 0.02;
}
// Flattens a workbook to text: one line per non-empty row, cells separated by
// tabs, sheets separated by blank lines.
function extractXlsxText(buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetTexts = [];
    for (const name of workbook.SheetNames) {
        // raw: false reads each cell's formatted text, matching the roster import.
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
            header: 1,
            defval: '',
            raw: false,
            blankrows: false,
        });
        const lines = rows
            .map((row) => row
            .map((cell) => {
            if (typeof cell === 'string') {
                return cell.trim();
            }
            if (typeof cell === 'number' || typeof cell === 'boolean') {
                return String(cell);
            }
            return '';
        })
            .filter(Boolean)
            .join('\t'))
            .filter(Boolean);
        if (lines.length > 0) {
            sheetTexts.push(lines.join('\n'));
        }
    }
    return sheetTexts.join('\n\n');
}
// Returns the plain-text content of an uploaded material. Everything is
// processed in memory; nothing is written to disk or database. Recognized
// binary formats (pdf, docx, pptx, xlsx) get dedicated parsers; every other
// upload is treated as plain text (source code, notes, …) after a binary
// sniff — there is no extension whitelist to maintain.
export async function extractMaterialText(buffer, filename) {
    const extension = filename.toLowerCase().split('.').pop() ?? '';
    let text;
    try {
        switch (extension) {
            case 'pdf': {
                const result = await pdfParse(buffer);
                text = result.text;
                break;
            }
            case 'docx': {
                const result = await mammoth.extractRawText({ buffer });
                text = result.value;
                break;
            }
            case 'pptx':
                text = await extractPptxText(buffer);
                break;
            case 'xlsx':
            case 'xls':
                text = extractXlsxText(buffer);
                break;
            default:
                if (looksLikeBinary(buffer)) {
                    throw badRequest('This file appears to be binary, not text. Supported: any text or source-code file, plus pdf, docx, pptx and xlsx.');
                }
                text = buffer.toString('utf8');
        }
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }
        throw badRequest('Could not read the file. It may be corrupt or password-protected.');
    }
    const cleaned = text.replace(/\r\n/g, '\n').trim();
    if (cleaned.length === 0) {
        throw badRequest('No text could be extracted. Scanned/image-only files are not supported — paste the text instead.');
    }
    return {
        text: cleaned.slice(0, MAX_MATERIAL_CHARS),
        truncated: cleaned.length > MAX_MATERIAL_CHARS,
    };
}
// ------------------------------------------------------------ generation
const SYSTEM_PROMPT = `You are an exam-question author for a community college quizzing app (ELITEQuest). You read study material and produce quiz questions as strictly valid JSON.

Supported question types (the "type" field) and the exact JSON shape of their "data" object:

1. mcq_single — one correct answer. data: { "type": "mcq_single", "prompt": string, "options": [{ "id": "a", "text": string }, ...] (2-5 options, ids "a","b","c",...), "correct_option_id": "b" }
2. mcq_multi — several correct answers. data: { "type": "mcq_multi", "prompt": string, "options": [{ "id": "a", "text": string }, ...] (2-6 options), "correct_option_ids": ["a","c"], "allow_partial": false, "partial_points": 0 }
3. short_answer — free-text answer checked against accepted answers. data: { "type": "short_answer", "prompt": string, "accepted_answers": ["Paris", ...] (at least 1, include common variants), "case_sensitive": false }
4. fill_blanks — sentence(s) with blanks. data: { "type": "fill_blanks", "prompt": string, "segments": [{ "text": string, "blank": boolean, "answer": string }, ...] } — exactly the segments that have "blank": true must have an "answer"; render blanks in the prompt as ___.
5. matching — pair left items with right items. data: { "type": "matching", "prompt": string, "left_items": [{ "id": "l1", "text": string }, ...], "right_items": [{ "id": "r1", "text": string }, ...], "correct_pairs": { "l1": "r2" } } (3-6 pairs; shuffle the right items so they are not aligned)
6. grouping — sort items into named groups. data: { "type": "grouping", "prompt": string, "groups": [{ "id": "g1", "name": string }, ...], "items": [{ "id": "i1", "text": string, "group_id": "g1" }, ...] } (2-5 groups, 6-12 items)
7. word_cloud — open engagement prompt answered with a few words each, unscored. data: { "type": "word_cloud", "prompt": string, "max_words_per_student": 3 }
8. brainstorming — open idea-generation prompt, unscored. data: { "type": "brainstorming", "prompt": string, "allow_upvotes": true }

Rules:
- Each question object must contain: "type" (one of the 8), "prompt" (Markdown allowed), "data" (object exactly matching the shape above, whose "type" and "prompt" equal the outer ones), "points" (1 for scored types, 0 for word_cloud/brainstorming), "answer_mode": "individual", "bloom_level" (one of "remember", "understand", "apply").
- Pick the best type per question from the content: factual recall -> mcq_single or fill_blanks; terms/definitions -> matching or fill_blanks; categories/relationships -> grouping or matching; explanations/concepts -> short_answer or mcq_multi; scenarios/applications -> mcq_single or short_answer; open engagement/opinions -> word_cloud or brainstorming (sparingly).
- Bloom's levels: "remember" = recall facts/terms, "understand" = explain/summarize/classify, "apply" = use knowledge in a new situation.
- Distractors must be plausible but clearly wrong to an expert.
- Base every question ONLY on the provided material, and write it in the same language as the material.
- IDs inside "data" must be short and unique within that question.

Respond with ONLY a JSON object of this shape: { "questions": [ ... ] }`;
function buildBloomInstruction(selected) {
    if (!selected || selected.length === 0) {
        return 'Choose the most fitting bloom_level for each question from: remember, understand, apply.';
    }
    return `Every question's bloom_level MUST be one of: ${selected.join(', ')}. Distribute the questions across the selected levels.`;
}
function buildUserPrompt(input) {
    const lines = [];
    if (input.prompt && input.prompt.trim().length > 0) {
        lines.push(`Additional instructions from the lecturer: ${input.prompt.trim()}`);
    }
    lines.push(buildBloomInstruction(input.bloom_levels));
    lines.push(`Generate ${input.count} question(s).`);
    lines.push('MATERIAL:');
    lines.push('"""');
    lines.push(input.material_text);
    lines.push('"""');
    return lines.join('\n');
}
function parseJsonObject(raw) {
    const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
        }
    }
    catch {
        // fall through
    }
    throw new AppError('AI_BAD_RESPONSE', 502, 'The AI returned an unreadable response. Try again.');
}
function zodIssues(err) {
    return err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
}
// Validates candidates one by one so a single bad question does not sink the
// batch. Returns the valid ones plus the Zod issues of the invalid ones
// (used by the repair retry).
function validateCandidates(raw) {
    const valid = [];
    const invalidIssues = [];
    const list = raw.questions;
    if (!Array.isArray(list)) {
        throw new AppError('AI_BAD_RESPONSE', 502, 'The AI response had no questions array.');
    }
    for (const item of list) {
        const result = candidateQuestionSchema.safeParse(item);
        if (result.success) {
            valid.push(result.data);
        }
        else {
            invalidIssues.push(zodIssues(result.error));
        }
    }
    return { valid, invalidIssues };
}
async function callGroq(apiKey, model, messages) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);
    let response;
    try {
        response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.7,
                max_completion_tokens: MAX_COMPLETION_TOKENS,
                response_format: { type: 'json_object' },
            }),
            signal: controller.signal,
        });
    }
    catch {
        throw new AppError('AI_UNAVAILABLE', 504, 'The AI service did not respond in time. Try again.');
    }
    finally {
        clearTimeout(timer);
    }
    if (!response.ok) {
        // Surface a short reason without leaking headers or credentials.
        let reason = `${response.status}`;
        try {
            const body = (await response.json());
            if (typeof body.error?.message === 'string') {
                reason = body.error.message.slice(0, 200);
            }
        }
        catch {
            // keep the status code as the reason
        }
        throw new AppError('AI_PROVIDER_ERROR', 502, `AI provider error (${reason}). Try again.`);
    }
    const body = (await response.json());
    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.length === 0) {
        throw new AppError('AI_BAD_RESPONSE', 502, 'The AI returned an empty response. Try again.');
    }
    return parseJsonObject(content);
}
export async function generateQuestions(input) {
    const { apiKey, model: configuredModel, keyError } = await resolveGroqCredentials();
    if (keyError) {
        throw new AppError('AI_NOT_CONFIGURED', 503, 'The stored API key cannot be read (server secret changed). An admin must re-enter it in Settings.');
    }
    if (!apiKey) {
        throw new AppError('AI_NOT_CONFIGURED', 503, 'AI generation is not configured. An admin must set the Groq API key in Settings.');
    }
    const model = input.model ?? configuredModel ?? DEFAULT_GROQ_MODEL;
    const system = SYSTEM_PROMPT;
    const user = buildUserPrompt(input);
    const parsed = await callGroq(apiKey, model, [
        { role: 'system', content: system },
        { role: 'user', content: user },
    ]);
    const firstPass = validateCandidates(parsed);
    let valid = firstPass.valid;
    const invalidIssues = firstPass.invalidIssues;
    // One repair retry: give the model its invalid output plus the exact
    // validation errors and ask for corrected JSON. The repaired response is a
    // full batch, so it replaces the first pass only if it validated better.
    if (invalidIssues.length > 0) {
        try {
            const repaired = await callGroq(apiKey, model, [
                { role: 'system', content: system },
                {
                    role: 'user',
                    content: `${user}\n\nYour previous response failed schema validation for some questions. Validation errors:\n${invalidIssues.join('\n')}\n\nPrevious JSON:\n${JSON.stringify(parsed)}\n\nReturn the full corrected JSON object.`,
                },
            ]);
            const retry = validateCandidates(repaired);
            if (retry.valid.length > valid.length) {
                valid = retry.valid;
            }
        }
        catch {
            // Repair failed — keep whatever the first pass produced.
        }
    }
    let warning;
    if (valid.length === 0) {
        warning = 'The AI did not produce any valid questions. Try rephrasing the prompt or material.';
    }
    else if (valid.length < input.count) {
        warning = `Only ${valid.length} of the requested ${input.count} questions passed validation.`;
    }
    return generateQuestionsResponseSchema.parse({ questions: valid, warning });
}
// ------------------------------------------------------------ models list
export async function listGroqModels() {
    const { apiKey, keyError } = await resolveGroqCredentials();
    if (keyError || !apiKey) {
        return [];
    }
    const response = await fetch(`${GROQ_BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
        throw new AppError('AI_PROVIDER_ERROR', 502, 'Could not fetch the model list. Try again.');
    }
    const body = (await response.json());
    return (body.data ?? [])
        .map((m) => m.id)
        .filter((id) => typeof id === 'string')
        .sort();
}
//# sourceMappingURL=ai-generation.service.js.map
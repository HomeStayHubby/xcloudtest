import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import {
  extractMaterialText,
  generateQuestions,
  listGroqModels,
} from './ai-generation.service.js';
import { updateAiSettings } from '../settings/settings.service.js';
import { setup } from '../../testing/helpers.js';
import { env } from '../../shared/env.js';

const VALID_MCQ = {
  type: 'mcq_single',
  prompt: 'At what temperature does water boil at sea level?',
  data: {
    type: 'mcq_single',
    prompt: 'At what temperature does water boil at sea level?',
    options: [
      { id: 'a', text: '90 C' },
      { id: 'b', text: '100 C' },
    ],
    correct_option_id: 'b',
  },
  points: 1,
  answer_mode: 'individual',
  bloom_level: 'remember',
};

// Shape of a Groq chat-completions response with the given JSON content string.
function groqJson(content: unknown) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ choices: [{ message: { content: JSON.stringify(content) } }] }),
  };
}

function stubFetch(handler: (url: string, init?: RequestInit) => unknown) {
  // No `as typeof fetch` cast: the mock's return type stays `unknown`, so the
  // plain-object responses below type-check under any TS/vitest version.
  const fetchMock = vi.fn(handler);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('ai-generation service', () => {
  beforeEach(async () => {
    await setup();
    env.GROQ_API_KEY = undefined;
    env.GROQ_MODEL = undefined;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    env.GROQ_API_KEY = undefined;
    env.GROQ_MODEL = undefined;
  });

  describe('material extraction', () => {
    it('reads txt and md files and normalizes line endings', async () => {
      const md = await extractMaterialText(Buffer.from('# Title\r\n\r\nBody text'), 'notes.md');
      expect(md.text).toBe('# Title\n\nBody text');
      expect(md.truncated).toBe(false);

      const txt = await extractMaterialText(Buffer.from('plain text'), 'notes.txt');
      expect(txt.text).toBe('plain text');
    });

    it('reads source-code and extensionless files as plain text', async () => {
      const py = await extractMaterialText(
        Buffer.from('def add(a, b):\r\n    return a + b'),
        'math_utils.py'
      );
      expect(py.text).toBe('def add(a, b):\n    return a + b');

      const dart = await extractMaterialText(
        Buffer.from("void main() { print('hi'); }"),
        'main.dart'
      );
      expect(dart.text).toContain("print('hi')");

      const makefile = await extractMaterialText(Buffer.from('all: build'), 'Makefile');
      expect(makefile.text).toBe('all: build');
    });

    it('rejects binary-looking files with a clear message', async () => {
      const fakePng = Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.alloc(64, 0),
      ]);
      await expect(extractMaterialText(fakePng, 'image.png')).rejects.toThrow('binary');

      // UTF-16 "Unicode" text contains NUL bytes, so it is binary for us.
      await expect(
        extractMaterialText(Buffer.from('plain text', 'utf16le'), 'notes.txt')
      ).rejects.toThrow('binary');
    });

    it('extracts cell text from xlsx files', async () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet([
          ['Term', 'Definition'],
          ['Mitosis', 'Cell division into two identical cells'],
        ]),
        'Glossary'
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet([['Meiosis', 'Cell division producing gametes']]),
        'Glossary 2'
      );
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

      const result = await extractMaterialText(buffer, 'glossary.xlsx');
      expect(result.text).toContain('Term');
      expect(result.text).toContain('Mitosis');
      expect(result.text).toContain('Cell division into two identical cells');
      expect(result.text).toContain('Meiosis');
      // Sheets appear in workbook order.
      expect(result.text.indexOf('Mitosis')).toBeLessThan(result.text.indexOf('Meiosis'));
    });

    it('rejects files with no extractable text', async () => {
      await expect(
        extractMaterialText(Buffer.from('   \n\t  '), 'blank.txt')
      ).rejects.toThrow('No text could be extracted');
    });

    it('extracts slide text runs from pptx files', async () => {
      const zip = new JSZip();
      zip.file(
        'ppt/slides/slide1.xml',
        '<p:sld><a:p><a:r><a:t>Hello &amp; welcome</a:t></a:r></a:p></p:sld>'
      );
      zip.file(
        'ppt/slides/slide2.xml',
        '<p:sld><a:p><a:r><a:t>Second slide</a:t></a:r></a:p></p:sld>'
      );
      const buffer = await zip.generateAsync({ type: 'nodebuffer' });

      const result = await extractMaterialText(buffer, 'lecture.pptx');
      expect(result.text).toContain('Hello & welcome');
      expect(result.text).toContain('Second slide');
      // Slides stay in order.
      expect(result.text.indexOf('Hello')).toBeLessThan(result.text.indexOf('Second'));
    });

    it('truncates very large materials', async () => {
      const big = 'x'.repeat(150000);
      const result = await extractMaterialText(Buffer.from(big, 'utf8'), 'big.txt');
      expect(result.text.length).toBe(100000);
      expect(result.truncated).toBe(true);
    });
  });

  describe('question generation', () => {
    it('throws a helpful error when no API key is configured', async () => {
      await expect(
        generateQuestions({ material_text: 'Water boils at 100 C.', count: 1 })
      ).rejects.toThrow('AI generation is not configured');
    });

    it('falls back to the env API key when the admin has not stored one', async () => {
      env.GROQ_API_KEY = 'gsk_env_key_123456';
      const fetchMock = stubFetch(() => groqJson({ questions: [VALID_MCQ] }));

      const result = await generateQuestions({ material_text: 'Water boils at 100 C.', count: 1 });
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].bloom_level).toBe('remember');

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/chat/completions');
      expect((init.headers as Record<string, string>).Authorization).toBe(
        'Bearer gsk_env_key_123456'
      );
    });

    it('uses the admin-stored key and admin model by default', async () => {
      await updateAiSettings({ api_key: 'gsk_admin_key_123456', model: 'admin-model' });
      const fetchMock = stubFetch(() => groqJson({ questions: [VALID_MCQ] }));

      await generateQuestions({ material_text: 'Water boils at 100 C.', count: 1 });

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect((init.headers as Record<string, string>).Authorization).toBe(
        'Bearer gsk_admin_key_123456'
      );
      const adminBody = JSON.parse(init.body as string) as { model?: string };
      expect(adminBody.model).toBe('admin-model');
    });

    it('honors the per-run model override', async () => {
      await updateAiSettings({ api_key: 'gsk_admin_key_123456', model: 'admin-model' });
      const fetchMock = stubFetch(() => groqJson({ questions: [VALID_MCQ] }));

      await generateQuestions({
        material_text: 'Water boils at 100 C.',
        count: 1,
        model: 'custom-model',
      });

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const overrideBody = JSON.parse(init.body as string) as { model?: string };
      expect(overrideBody.model).toBe('custom-model');
    });

    it('repairs invalid candidates with one retry and replaces the batch', async () => {
      await updateAiSettings({ api_key: 'gsk_admin_key_123456' });
      const invalid = {
        ...VALID_MCQ,
        data: { ...VALID_MCQ.data, type: 'short_answer' }, // type/data.type mismatch
      };
      // First call returns the broken batch; the repair call (default impl)
      // returns the corrected batch. mockImplementationOnce queues first.
      const fetchMock = stubFetch(() => groqJson({ questions: [VALID_MCQ] }));
      fetchMock.mockImplementationOnce(() => groqJson({ questions: [invalid] }));

      const result = await generateQuestions({ material_text: 'Water boils at 100 C.', count: 1 });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].data.type).toBe('mcq_single');
    });

    it('returns a warning and no questions when both passes fail', async () => {
      await updateAiSettings({ api_key: 'gsk_admin_key_123456' });
      const broken = { type: 'nonsense_type', prompt: 'x', data: {}, points: 1, bloom_level: 'remember' };
      stubFetch(() => groqJson({ questions: [broken] }));

      const result = await generateQuestions({ material_text: 'Water boils at 100 C.', count: 2 });
      expect(result.questions).toHaveLength(0);
      expect(result.warning).toBeTruthy();
    });

    it('rejects unreadable AI responses', async () => {
      await updateAiSettings({ api_key: 'gsk_admin_key_123456' });
      stubFetch(() => ({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ choices: [{ message: { content: 'not json at all' } }] }),
      }));

      await expect(
        generateQuestions({ material_text: 'Water boils at 100 C.', count: 1 })
      ).rejects.toThrow('unreadable response');
    });

    it('surfaces provider errors without leaking credentials', async () => {
      await updateAiSettings({ api_key: 'gsk_admin_key_123456' });
      stubFetch(() => ({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } }),
      }));

      await expect(
        generateQuestions({ material_text: 'Water boils at 100 C.', count: 1 })
      ).rejects.toThrow('Invalid API key');
    });
  });

  describe('model listing', () => {
    it('returns an empty list when unconfigured', async () => {
      const models = await listGroqModels();
      expect(models).toEqual([]);
    });

    it('fetches and sorts model ids with the stored key', async () => {
      await updateAiSettings({ api_key: 'gsk_admin_key_123456' });
      const fetchMock = stubFetch(() => ({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [{ id: 'model-b' }, { id: 'model-a' }] }),
      }));

      const models = await listGroqModels();
      expect(models).toEqual(['model-a', 'model-b']);

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/models');
      expect((init.headers as Record<string, string>).Authorization).toBe(
        'Bearer gsk_admin_key_123456'
      );
    });
  });
});

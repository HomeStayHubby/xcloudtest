import { describe, it, expect } from 'vitest';
import {
  buildMaterialText,
  lastSentences,
  MATERIAL_TEXT_LIMIT,
} from './materialText.js';

describe('buildMaterialText', () => {
  it('merges sources with per-file headers in order', () => {
    const result = buildMaterialText([
      { name: 'a.pdf', text: 'alpha text' },
      { name: 'b.txt', text: 'beta text' },
    ]);
    expect(result.text).toBe('=== a.pdf ===\nalpha text\n\n=== b.txt ===\nbeta text');
    expect(result.sections.map((s) => s.status)).toEqual(['complete', 'complete']);
    expect(result.sections.map((s) => s.totalChars)).toEqual([10, 9]);
  });

  it('leaves small sources untouched', () => {
    const result = buildMaterialText([{ name: 'a.txt', text: 'hello' }]);
    expect(result.text).toBe('=== a.txt ===\nhello');
    expect(result.sections[0]).toEqual({
      name: 'a.txt',
      status: 'complete',
      totalChars: 5,
      includedChars: 5,
      lastIncludedSentences: [],
    });
  });

  it('truncates a source that straddles the budget at a word boundary', () => {
    const bigText = 'A'.repeat(60000) + ' ' + 'B'.repeat(60000);
    const result = buildMaterialText([{ name: 'f.txt', text: bigText }]);

    expect(result.text.length).toBeLessThanOrEqual(MATERIAL_TEXT_LIMIT);
    expect(result.text.endsWith('A')).toBe(true);
    expect(result.sections[0].status).toBe('truncated');
    expect(result.sections[0].totalChars).toBe(120001);
    expect(result.sections[0].includedChars).toBe(60000);
  });

  it('hard-cuts a source with no word boundary', () => {
    const result = buildMaterialText([{ name: 'f.txt', text: 'A'.repeat(120000) }]);

    expect(result.text.length).toBeLessThanOrEqual(MATERIAL_TEXT_LIMIT);
    expect(result.sections[0].status).toBe('truncated');
    expect(result.sections[0].includedChars).toBe(MATERIAL_TEXT_LIMIT - '=== f.txt ===\n'.length);
  });

  it('marks later sources not-included once the budget is exhausted', () => {
    const filler = 'word '.repeat(25000).trim();
    const result = buildMaterialText([
      { name: 'a.txt', text: filler },
      { name: 'b.txt', text: 'tiny' },
    ]);

    expect(result.sections[0].status).toBe('truncated');
    expect(result.sections[1]).toEqual({
      name: 'b.txt',
      status: 'not-included',
      totalChars: 4,
      includedChars: 0,
      lastIncludedSentences: [],
    });
    expect(result.text).not.toContain('tiny');
    expect(result.text.length).toBeLessThanOrEqual(MATERIAL_TEXT_LIMIT);
  });

  it('never exceeds the limit with many sources', () => {
    const sources = Array.from({ length: 12 }, (_, i) => ({
      name: `f${i}.txt`,
      text: 'x'.repeat(20000),
    }));
    const result = buildMaterialText(sources);

    expect(result.text.length).toBeLessThanOrEqual(MATERIAL_TEXT_LIMIT);
    expect(result.sections.map((s) => s.status)).toEqual([
      'complete',
      'complete',
      'complete',
      'complete',
      'truncated',
      ...Array.from({ length: 7 }, () => 'not-included' as const),
    ]);
  });

  it('reports the last included sentences for truncated sources', () => {
    const text = 'First sentence. Second sentence. Third sentence. ' + 'x'.repeat(149950);
    const result = buildMaterialText([
      { name: 'f.txt', text },
      { name: 'g.txt', text: 'more' },
    ]);

    expect(result.sections[0].status).toBe('truncated');
    expect(result.sections[0].lastIncludedSentences).toEqual([
      'First sentence.',
      'Second sentence.',
      'Third sentence.',
    ]);
    expect(result.sections[1].status).toBe('not-included');
  });

  it('skips empty sources', () => {
    const result = buildMaterialText([
      { name: 'a.txt', text: '   ' },
      { name: 'b.txt', text: 'real' },
    ]);
    expect(result.text).toBe('=== b.txt ===\nreal');
    expect(result.sections).toHaveLength(1);
  });
});

describe('lastSentences', () => {
  it('returns the last complete sentences', () => {
    expect(lastSentences('One. Two. Three. Four.')).toEqual(['Two.', 'Three.', 'Four.']);
  });

  it('drops a trailing incomplete sentence', () => {
    expect(lastSentences('One. Two. Three. Four and five')).toEqual([
      'One.',
      'Two.',
      'Three.',
    ]);
  });

  it('falls back to lines when there is no sentence punctuation', () => {
    expect(lastSentences('- point one\n- point two\n- point three')).toEqual([
      '- point one',
      '- point two',
      '- point three',
    ]);
  });

  it('does not split decimals or mid-word periods', () => {
    expect(lastSentences('Pi is 3.14 exactly. It ends here.')).toEqual([
      'Pi is 3.14 exactly.',
      'It ends here.',
    ]);
  });

  it('caps each sentence length for readability', () => {
    const long = 'word '.repeat(100).trim() + '.';
    const [first] = lastSentences(long, 1);
    expect(first.startsWith('word')).toBe(true);
    expect(first.endsWith('…')).toBe(true);
    expect(first.length).toBeLessThanOrEqual(201);
  });

  it('respects a custom max', () => {
    expect(lastSentences('One. Two. Three. Four.', 1)).toEqual(['Four.']);
  });

  it('returns empty for empty text', () => {
    expect(lastSentences('   ')).toEqual([]);
  });
});

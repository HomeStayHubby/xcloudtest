// Merges AI-generation material sources (uploaded files + pasted notes) into a
// single `material_text` string that always fits the shared schema's
// 100,000-character cap. Sources fill the budget in the given order; a source
// that straddles the limit is cut at a word boundary and reported as
// 'truncated', later sources as 'not-included'.

export const MATERIAL_TEXT_LIMIT = 100000;
export const PASTED_NOTES_NAME = 'Pasted notes';

const PREVIEW_SENTENCES = 3;
const PREVIEW_SENTENCE_MAX_CHARS = 200;

export type SectionStatus = 'complete' | 'truncated' | 'not-included';

export type MaterialSource = {
  name: string;
  text: string;
};

export type SectionReport = {
  name: string;
  status: SectionStatus;
  totalChars: number;
  includedChars: number;
  // Only set for truncated sections: the last complete sentences that made it
  // in, so the lecturer can see roughly where the cut happened.
  lastIncludedSentences: string[];
};

export type MaterialMergeResult = {
  text: string;
  sections: SectionReport[];
};

export function buildMaterialText(sources: MaterialSource[]): MaterialMergeResult {
  const sections: SectionReport[] = [];
  const parts: string[] = [];
  let used = 0;

  for (const source of sources) {
    const total = source.text.length;
    if (source.text.trim().length === 0) {
      continue;
    }
    const header = `=== ${source.name} ===\n`;
    const separator = parts.length === 0 ? '' : '\n\n';
    const available = MATERIAL_TEXT_LIMIT - used - header.length - separator.length;

    if (available <= 0) {
      sections.push({
        name: source.name,
        status: 'not-included',
        totalChars: total,
        includedChars: 0,
        lastIncludedSentences: [],
      });
      continue;
    }

    if (total <= available) {
      parts.push(separator + header + source.text);
      used += separator.length + header.length + total;
      sections.push({
        name: source.name,
        status: 'complete',
        totalChars: total,
        includedChars: total,
        lastIncludedSentences: [],
      });
      continue;
    }

    const included = sliceAtWordBoundary(source.text, available);
    parts.push(separator + header + included);
    used += separator.length + header.length + included.length;
    sections.push({
      name: source.name,
      status: 'truncated',
      totalChars: total,
      includedChars: included.length,
      lastIncludedSentences: lastSentences(included),
    });
  }

  return { text: parts.join(''), sections };
}

// Returns the last complete sentences of `text`. Falls back to the last lines
// when there is no sentence punctuation (e.g. slide bullets). Heuristic split:
// abbreviations like "e.g." or "Dr." are treated as sentence ends.
export function lastSentences(text: string, max: number = PREVIEW_SENTENCES): string[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const endsClean = /[.!?]["')\]]*$/.test(trimmed);
  const sentences = splitSentences(trimmed);
  const complete = endsClean ? sentences : sentences.slice(0, -1);
  let picked = complete.slice(-max);

  if (picked.length === 0) {
    picked = trimmed
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(-max);
  }

  return picked.map((sentence) =>
    sentence.length > PREVIEW_SENTENCE_MAX_CHARS
      ? sentence.slice(0, PREVIEW_SENTENCE_MAX_CHARS) + '…'
      : sentence
  );
}

function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    current += ch;
    if (ch === '.' || ch === '!' || ch === '?') {
      let j = i + 1;
      while (j < text.length && '")]\''.includes(text[j])) {
        j++;
      }
      if (j >= text.length || /\s/.test(text[j])) {
        sentences.push((current + text.slice(i + 1, j)).trim());
        current = '';
        i = j - 1;
      }
    }
  }
  if (current.trim().length > 0) {
    sentences.push(current.trim());
  }
  return sentences;
}

function sliceAtWordBoundary(text: string, maxLen: number): string {
  const cut = text.slice(0, maxLen);
  const boundary = Math.max(cut.lastIndexOf('\n'), cut.lastIndexOf(' '));
  // Only back off to the boundary when it keeps most of the slice — a lone
  // early space (or none, e.g. one giant word) should not waste the budget.
  return boundary > maxLen * 0.5 ? cut.slice(0, boundary).trimEnd() : cut;
}

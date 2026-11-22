import type {
  QuestionData,
  ResponseAnswer,
} from '@elitequest/shared';

export function scoreResponse(
  data: QuestionData,
  answer: ResponseAnswer,
  points: number
): number | null {
  switch (data.type) {
    case 'mcq_single':
      return scoreMcqSingle(data, answer, points);
    case 'mcq_multi':
      return scoreMcqMulti(data, answer, points);
    case 'short_answer':
      return scoreShortAnswer(data, answer, points);
    case 'fill_blanks':
      return scoreFillBlanks(data, answer, points);
    case 'matching':
      return scoreMatching(data, answer, points);
    case 'grouping':
      return scoreGrouping(data, answer, points);
    case 'word_cloud':
    case 'brainstorming':
      return null;
    default:
      return null;
  }
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function scoreMcqSingle(
  data: Extract<QuestionData, { type: 'mcq_single' }>,
  answer: ResponseAnswer,
  points: number
): number {
  if (typeof answer !== 'string') return 0;
  return answer === data.correct_option_id ? points : 0;
}

function scoreMcqMulti(
  data: Extract<QuestionData, { type: 'mcq_multi' }>,
  answer: ResponseAnswer,
  points: number
): number {
  if (!Array.isArray(answer)) return 0;
  const selected = new Set(answer);
  const correct = new Set(data.correct_option_ids);

  const correctSelected = [...correct].filter((id) => selected.has(id)).length;
  const wrongSelected = [...selected].filter((id) => !correct.has(id)).length;
  const totalCorrect = correct.size;

  if (totalCorrect === 0) return 0;

  if (data.allow_partial) {
    const perCorrect = points / totalCorrect;
    const perWrong = data.partial_points ?? 0;
    const score = correctSelected * perCorrect - wrongSelected * perWrong;
    return Math.max(0, score);
  }

  const allCorrect = correctSelected === totalCorrect && wrongSelected === 0;
  return allCorrect ? points : 0;
}

function scoreShortAnswer(
  data: Extract<QuestionData, { type: 'short_answer' }>,
  answer: ResponseAnswer,
  points: number
): number {
  if (typeof answer !== 'string') return 0;
  const normalizedAnswer = data.case_sensitive ? answer.trim() : normalize(answer);
  const matches = data.accepted_answers.some((accepted) => {
    const normalizedAccepted = data.case_sensitive
      ? accepted.trim()
      : normalize(accepted);
    return normalizedAnswer === normalizedAccepted;
  });
  return matches ? points : 0;
}

function scoreFillBlanks(
  data: Extract<QuestionData, { type: 'fill_blanks' }>,
  answer: ResponseAnswer,
  points: number
): number {
  const blanks = data.segments.filter((seg) => seg.blank);
  if (!Array.isArray(answer) || answer.length !== blanks.length) return 0;

  const expected = blanks.map((seg) => normalize(seg.answer ?? ''));
  let correct = 0;
  for (let i = 0; i < expected.length; i++) {
    if (normalize(String(answer[i])) === expected[i]) {
      correct++;
    }
  }
  return (correct / expected.length) * points;
}

function scoreMatching(
  data: Extract<QuestionData, { type: 'matching' }>,
  answer: ResponseAnswer,
  points: number
): number {
  if (answer === null || typeof answer !== 'object' || Array.isArray(answer)) return 0;
  const pairs = answer as Record<string, string>;
  let correct = 0;
  for (const leftId of Object.keys(data.correct_pairs)) {
    if (pairs[leftId] === data.correct_pairs[leftId]) {
      correct++;
    }
  }
  const total = Object.keys(data.correct_pairs).length;
  return total === 0 ? 0 : (correct / total) * points;
}

function scoreGrouping(
  data: Extract<QuestionData, { type: 'grouping' }>,
  answer: ResponseAnswer,
  points: number
): number {
  if (answer === null || typeof answer !== 'object' || Array.isArray(answer)) return 0;
  const groups = answer as Record<string, string>;
  let correct = 0;
  for (const item of data.items) {
    if (groups[item.id] === item.group_id) {
      correct++;
    }
  }
  const total = data.items.length;
  return total === 0 ? 0 : (correct / total) * points;
}

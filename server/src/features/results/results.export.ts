import * as XLSX from 'xlsx';
import type { QuizResults } from '@elitequest/shared';

export function exportQuizResultsToXlsx(results: QuizResults): Buffer {
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.json_to_sheet(
    results.summary.map((s) => ({
      question: s.prompt,
      type: s.type,
      answer_mode: s.answer_mode,
      points: s.points,
      responses: s.response_count,
      average_score: s.average_score ?? '',
      correct_rate: s.correct_rate ?? '',
    }))
  );
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  const responsesSheet = XLSX.utils.json_to_sheet(
    results.responses.map((r) => ({
      question: r.prompt,
      type: r.type,
      student: r.student_name ?? '',
      class: r.class_name ?? '',
      group: r.group_name ?? '',
      answer: r.answer,
      score: r.score ?? '',
      submitted_at: r.submitted_at,
    }))
  );
  XLSX.utils.book_append_sheet(workbook, responsesSheet, 'Responses');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

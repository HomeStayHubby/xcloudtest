import type { Question, PublicQuestion, QuestionData, PublicQuestionData } from '@elitequest/shared';

export function sanitizeQuestion(question: Question): PublicQuestion {
  return {
    ...question,
    data: sanitizeQuestionData(question.data),
  };
}

export function sanitizeQuestionData(data: QuestionData): PublicQuestionData {
  switch (data.type) {
    case 'mcq_single': {
      const { correct_option_id: _removed, ...rest } = data;
      return rest;
    }
    case 'mcq_multi': {
      const { correct_option_ids: _removed, ...rest } = data;
      return rest;
    }
    case 'short_answer': {
      const { accepted_answers: _a, case_sensitive: _c, ...rest } = data;
      return rest;
    }
    case 'fill_blanks': {
      return {
        type: data.type,
        prompt: data.prompt,
        segments: data.segments.map((segment) => ({
          text: segment.text,
          blank: segment.blank,
        })),
      };
    }
    case 'matching': {
      const { correct_pairs: _removed, ...rest } = data;
      return rest;
    }
    case 'grouping': {
      return {
        type: data.type,
        prompt: data.prompt,
        groups: data.groups,
        items: data.items.map((item) => ({ id: item.id, text: item.text })),
      };
    }
    case 'word_cloud':
    case 'brainstorming': {
      return { ...data };
    }
  }
}

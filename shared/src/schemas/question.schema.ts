import { z } from 'zod';

export const questionTypeSchema = z.enum([
  'mcq_single',
  'mcq_multi',
  'short_answer',
  'fill_blanks',
  'matching',
  'grouping',
  'word_cloud',
  'brainstorming',
]);

// Bloom's taxonomy (revised), levels 1-3 only. AI-generated questions are
// tagged automatically; manual questions may omit it.
export const bloomLevelSchema = z.enum(['remember', 'understand', 'apply']);

// prompt is authored as Markdown and rendered to sanitized HTML on the client.
const baseQuestionDataSchema = z.object({
  prompt: z.string().min(1).max(20000),
});

const mcqSingleDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('mcq_single'),
  options: z.array(z.object({ id: z.string(), text: z.string().min(1).max(2000) })).min(2),
  correct_option_id: z.string().min(1),
});

const mcqMultiDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('mcq_multi'),
  options: z.array(z.object({ id: z.string(), text: z.string().min(1).max(2000) })).min(2),
  correct_option_ids: z.array(z.string().min(1)).min(1),
  allow_partial: z.boolean().default(false),
  partial_points: z.number().min(0).max(1).default(0),
});

const shortAnswerDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('short_answer'),
  accepted_answers: z.array(z.string().min(1)).min(1),
  case_sensitive: z.boolean().default(false),
});

const fillBlanksDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('fill_blanks'),
  segments: z.array(
    z.object({
      text: z.string(),
      blank: z.boolean().default(false),
      answer: z.string().optional(),
    })
  ),
});

const matchingDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('matching'),
  left_items: z.array(z.object({ id: z.string(), text: z.string().min(1) })),
  right_items: z.array(z.object({ id: z.string(), text: z.string().min(1) })),
  correct_pairs: z.record(z.string().min(1)),
});

const groupingDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('grouping'),
  groups: z.array(z.object({ id: z.string(), name: z.string().min(1) })),
  items: z.array(z.object({ id: z.string(), text: z.string().min(1), group_id: z.string().min(1) })),
});

const wordCloudDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('word_cloud'),
  max_words_per_student: z.number().int().positive().default(3),
});

const brainstormingDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('brainstorming'),
  allow_upvotes: z.boolean().default(true),
  max_ideas_per_student: z.number().int().positive().optional(),
});

export const questionDataSchema = z.discriminatedUnion('type', [
  mcqSingleDataSchema,
  mcqMultiDataSchema,
  shortAnswerDataSchema,
  fillBlanksDataSchema,
  matchingDataSchema,
  groupingDataSchema,
  wordCloudDataSchema,
  brainstormingDataSchema,
]);

export const questionSchema = z.object({
  id: z.number().int().positive(),
  // Quiz questions have quiz_id set; bank questions have bank_id set.
  quiz_id: z.number().int().positive().nullable().optional(),
  bank_id: z.number().int().positive().nullable().optional(),
  order_index: z.number().int().nonnegative(),
  type: questionTypeSchema,
  prompt: z.string().min(1).max(20000),
  data: questionDataSchema,
  answer_mode: z.enum(['individual', 'group']).default('individual'),
  // Unscored live types (word cloud, brainstorming) use 0 points.
  points: z.number().min(0).default(1),
  time_limit_seconds: z.number().int().positive().nullable().optional(),
  bloom_level: bloomLevelSchema.nullable().optional(),
  created_at: z.string().datetime().or(z.date()),
});

export const createQuestionSchema = questionSchema
  .omit({
    id: true,
    created_at: true,
  })
  .extend({
    // Computed server-side when omitted.
    order_index: z.number().int().nonnegative().optional(),
  });

export const updateQuestionSchema = createQuestionSchema.partial();

// Public (student-facing) schemas: correct answers removed.
const publicMcqSingleDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('mcq_single'),
  options: z.array(z.object({ id: z.string(), text: z.string().max(2000) })).min(2),
});

const publicMcqMultiDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('mcq_multi'),
  options: z.array(z.object({ id: z.string(), text: z.string().max(2000) })).min(2),
  allow_partial: z.boolean(),
});

const publicShortAnswerDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('short_answer'),
});

const publicFillBlanksDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('fill_blanks'),
  segments: z.array(z.object({ text: z.string(), blank: z.boolean() })),
});

const publicMatchingDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('matching'),
  left_items: z.array(z.object({ id: z.string(), text: z.string() })),
  right_items: z.array(z.object({ id: z.string(), text: z.string() })),
});

const publicGroupingDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('grouping'),
  groups: z.array(z.object({ id: z.string(), name: z.string() })),
  items: z.array(z.object({ id: z.string(), text: z.string() })),
});

const publicWordCloudDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('word_cloud'),
  max_words_per_student: z.number().int().positive(),
});

const publicBrainstormingDataSchema = baseQuestionDataSchema.extend({
  type: z.literal('brainstorming'),
  allow_upvotes: z.boolean(),
  max_ideas_per_student: z.number().int().positive().optional(),
});

export const publicQuestionDataSchema = z.discriminatedUnion('type', [
  publicMcqSingleDataSchema,
  publicMcqMultiDataSchema,
  publicShortAnswerDataSchema,
  publicFillBlanksDataSchema,
  publicMatchingDataSchema,
  publicGroupingDataSchema,
  publicWordCloudDataSchema,
  publicBrainstormingDataSchema,
]);

export const publicQuestionSchema = questionSchema.extend({
  data: publicQuestionDataSchema,
});

export type QuestionType = z.infer<typeof questionTypeSchema>;
export type BloomLevel = z.infer<typeof bloomLevelSchema>;
export type Question = z.infer<typeof questionSchema>;
export type CreateQuestion = z.infer<typeof createQuestionSchema>;
export type UpdateQuestion = z.infer<typeof updateQuestionSchema>;
export type QuestionData = z.infer<typeof questionDataSchema>;
export type PublicQuestionData = z.infer<typeof publicQuestionDataSchema>;
export type PublicQuestion = z.infer<typeof publicQuestionSchema>;

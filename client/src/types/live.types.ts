export type WordCloudEntry = {
  word: string;
  count: number;
  submitters?: string[];
};

export type BrainstormEntry = {
  idea: string;
  count: number;
  upvotes: number;
  submitters?: string[];
};

export type AggregationData =
  | { type: 'word_cloud'; words: WordCloudEntry[] }
  | { type: 'brainstorming'; ideas: BrainstormEntry[] }
  | { type: 'none' };

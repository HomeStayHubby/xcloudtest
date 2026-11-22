export type WordCloudEntry = {
    word: string;
    count: number;
    submitters: string[];
};
export type BrainstormEntry = {
    idea: string;
    count: number;
    upvotes: number;
    submitters: string[];
};
export type AggregationData = {
    type: 'word_cloud';
    words: WordCloudEntry[];
} | {
    type: 'brainstorming';
    ideas: BrainstormEntry[];
} | {
    type: 'none';
};
export declare function getAggregationsByQuestion(questionId: number): Promise<AggregationData>;
export declare function upvoteBrainstormIdea(questionId: number, studentId: number | undefined, groupId: number | undefined, idea: string): Promise<AggregationData>;
//# sourceMappingURL=aggregation.service.d.ts.map
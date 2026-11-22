import { type GenerateQuestionsRequest, type GenerateQuestionsResponse } from '@elitequest/shared';
export declare function extractMaterialText(buffer: Buffer, filename: string): Promise<{
    text: string;
    truncated: boolean;
}>;
export declare function generateQuestions(input: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse>;
export declare function listGroqModels(): Promise<string[]>;
//# sourceMappingURL=ai-generation.service.d.ts.map
export interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface GroqChatCompletionResponse {
    choices?: {
        message?: {
            content?: string;
        };
    }[];
}
export interface GroqModelsResponse {
    data?: {
        id?: string;
    }[];
}
export interface GroqCallOptions {
    apiKey: string;
    model: string;
    messages: GroqMessage[];
    timeoutMs: number;
}
export declare const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
export declare const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
//# sourceMappingURL=ai-generation.types.d.ts.map
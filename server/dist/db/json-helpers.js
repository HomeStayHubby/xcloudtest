import { questionDataSchema, quizSettingsSchema } from '@elitequest/shared';
export function parseQuestionData(raw) {
    const parsed = JSON.parse(raw);
    return questionDataSchema.parse(parsed);
}
export function stringifyQuestionData(data) {
    return JSON.stringify(questionDataSchema.parse(data));
}
export function parseQuizSettings(raw) {
    const parsed = JSON.parse(raw);
    return quizSettingsSchema.parse(parsed);
}
export function stringifyQuizSettings(settings) {
    return JSON.stringify(quizSettingsSchema.parse(settings));
}
//# sourceMappingURL=json-helpers.js.map
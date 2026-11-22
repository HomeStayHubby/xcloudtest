import type { Actor } from '../../shared/permissions.js';
import type { QuestionBankDetail } from '@elitequest/shared';
export declare function listBanks(user: Actor): Promise<QuestionBankDetail[]>;
export declare function getBank(user: Actor, id: number): Promise<QuestionBankDetail>;
export declare function createBank(user: Actor, input: {
    title: string;
    description?: string;
}): Promise<QuestionBankDetail>;
export declare function updateBank(user: Actor, id: number, input: {
    title?: string;
    description?: string;
}): Promise<QuestionBankDetail>;
export declare function deleteBank(user: Actor, id: number): Promise<void>;
export declare function listBankQuestions(user: Actor, bankId: number): Promise<unknown[]>;
//# sourceMappingURL=question-bank.service.d.ts.map
import type { PublicUser, StudentAccount, Quiz } from '@elitequest/shared';
export declare function uniqueId(prefix: string): string;
export declare function setup(): Promise<void>;
export declare function wipeAll(): Promise<void>;
export declare function makeLecturer(isAdmin?: boolean, display?: string): Promise<PublicUser>;
export declare function makeClass(advisor: PublicUser, name?: string): Promise<{
    id: number;
    is_active: boolean;
    created_at: string | Date;
    code: string;
    updated_at: string | Date;
    name: string;
    description?: string | undefined;
    advisor_id?: number | null | undefined;
}>;
export declare function makeStudent(advisor: PublicUser, classId: number, displayName?: string): Promise<StudentAccount>;
export declare function makeOpenQuizForClass(advisor: PublicUser, classId: number, title?: string, questionCount?: number): Promise<Quiz>;
export declare function seedUserRow(email: string, role: 'lecturer' | 'student', options?: {
    is_admin?: number;
    is_active?: number;
    username?: string;
}): Promise<number>;
//# sourceMappingURL=helpers.d.ts.map
import { z } from 'zod';
export declare const groupSchema: z.ZodObject<{
    id: z.ZodNumber;
    quiz_id: z.ZodNumber;
    name: z.ZodString;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: string | Date;
    name: string;
    quiz_id: number;
}, {
    id: number;
    created_at: string | Date;
    name: string;
    quiz_id: number;
}>;
export declare const createGroupSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const updateGroupSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
}, {
    name?: string | undefined;
}>;
export declare const groupMemberSchema: z.ZodObject<{
    id: z.ZodNumber;
    group_id: z.ZodNumber;
    student_id: z.ZodNumber;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: string | Date;
    group_id: number;
    student_id: number;
}, {
    id: number;
    created_at: string | Date;
    group_id: number;
    student_id: number;
}>;
export declare const addGroupMemberSchema: z.ZodObject<{
    student_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    student_id: number;
}, {
    student_id: number;
}>;
export type Group = z.infer<typeof groupSchema>;
export type CreateGroup = z.infer<typeof createGroupSchema>;
export type UpdateGroup = z.infer<typeof updateGroupSchema>;
export type GroupMember = z.infer<typeof groupMemberSchema>;
export type AddGroupMember = z.infer<typeof addGroupMemberSchema>;
//# sourceMappingURL=group.schema.d.ts.map
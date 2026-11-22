import { z } from 'zod';

// Groups belong to a single quiz; members are students (users) enrolled in
// any class the quiz is released to.
export const groupSchema = z.object({
  id: z.number().int().positive(),
  quiz_id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  created_at: z.string().datetime().or(z.date()),
});

export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateGroupSchema = createGroupSchema.partial();

export const groupMemberSchema = z.object({
  id: z.number().int().positive(),
  group_id: z.number().int().positive(),
  student_id: z.number().int().positive(),
  created_at: z.string().datetime().or(z.date()),
});

export const addGroupMemberSchema = z.object({
  student_id: z.number().int().positive(),
});

export type Group = z.infer<typeof groupSchema>;
export type CreateGroup = z.infer<typeof createGroupSchema>;
export type UpdateGroup = z.infer<typeof updateGroupSchema>;
export type GroupMember = z.infer<typeof groupMemberSchema>;
export type AddGroupMember = z.infer<typeof addGroupMemberSchema>;

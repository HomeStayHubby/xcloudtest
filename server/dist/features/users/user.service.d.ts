import { createLecturerSchema, updateLecturerSchema } from '@elitequest/shared';
import { z } from 'zod';
import type { PublicUser } from '@elitequest/shared';
export type CreateLecturerInput = z.input<typeof createLecturerSchema>;
export type UpdateLecturerInput = z.input<typeof updateLecturerSchema>;
export declare function listLecturers(): Promise<PublicUser[]>;
export declare function getLecturerById(id: number): Promise<PublicUser>;
export declare function createLecturer(input: CreateLecturerInput): Promise<PublicUser>;
export declare function updateLecturer(id: number, input: UpdateLecturerInput): Promise<PublicUser>;
export declare function resetLecturerPassword(id: number, password: string): Promise<void>;
//# sourceMappingURL=user.service.d.ts.map
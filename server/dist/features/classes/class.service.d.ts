import { type Actor } from '../../shared/permissions.js';
import type { Class, ClassSummary, CreateClass, UpdateClass } from '@elitequest/shared';
export declare function listClasses(): Promise<ClassSummary[]>;
export declare function getClassById(id: number): Promise<Class>;
export declare function getClassByCode(code: string): Promise<Class | undefined>;
export declare function assertClassManager(user: Actor, classId: number): Promise<Class>;
export declare function createClass(input: CreateClass, advisorId: number): Promise<Class>;
export declare function updateClass(id: number, input: UpdateClass, actor: Actor): Promise<Class>;
export declare function deleteClass(id: number, actor: Actor): Promise<void>;
//# sourceMappingURL=class.service.d.ts.map
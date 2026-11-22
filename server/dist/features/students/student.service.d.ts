import type { Actor } from '../../shared/permissions.js';
import type { StudentAccount, CreateStudentAccount, UpdateStudentAccount, StudentImportResult, BulkStudentAction, BulkStudentActionResult } from '@elitequest/shared';
export declare function listStudentsByClass(classId: number): Promise<StudentAccount[]>;
export declare function getStudentAccountById(id: number): Promise<StudentAccount>;
export declare function createStudentAccount(actor: Actor, classId: number, input: CreateStudentAccount): Promise<StudentAccount>;
export declare function updateStudentAccount(actor: Actor, id: number, input: UpdateStudentAccount): Promise<StudentAccount>;
export declare function setStudentPassword(actor: Actor, id: number, password: string): Promise<void>;
export declare function deleteStudentAccount(actor: Actor, id: number): Promise<void>;
export declare function bulkStudentAction(actor: Actor, classId: number, input: BulkStudentAction): Promise<BulkStudentActionResult>;
export declare function importStudentsFromXlsx(actor: Actor, classId: number, buffer: Buffer): Promise<StudentImportResult>;
export declare function exportStudentsToXlsx(actor: Actor, classId: number): Promise<Buffer>;
//# sourceMappingURL=student.service.d.ts.map
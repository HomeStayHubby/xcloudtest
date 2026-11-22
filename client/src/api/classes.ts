import { api } from './client.js';
import type {
  Class,
  ClassSummary,
  CreateClass,
  UpdateClass,
  StudentAccount,
  CreateStudentAccount,
  UpdateStudentAccount,
  StudentImportResult,
  BulkStudentAction,
  BulkStudentActionResult,
} from '@elitequest/shared';
export type {
  Class,
  ClassSummary,
  CreateClass,
  UpdateClass,
  StudentAccount,
  CreateStudentAccount,
  UpdateStudentAccount,
  StudentImportResult,
  BulkStudentAction,
  BulkStudentActionResult,
} from '@elitequest/shared';

export function listClasses(): Promise<ClassSummary[]> {
  return api.get<ClassSummary[]>('/classes');
}

export function getClass(id: number): Promise<Class> {
  return api.get<Class>(`/classes/${id}`);
}

export function createClass(input: CreateClass): Promise<Class> {
  return api.post<Class>('/classes', input);
}

export function updateClass(id: number, input: UpdateClass): Promise<Class> {
  return api.patch<Class>(`/classes/${id}`, input);
}

export function deleteClass(id: number): Promise<void> {
  return api.delete<void>(`/classes/${id}`);
}

export function listStudents(classId: number): Promise<StudentAccount[]> {
  return api.get<StudentAccount[]>(`/classes/${classId}/students`);
}

export function createStudent(classId: number, input: CreateStudentAccount): Promise<StudentAccount> {
  return api.post<StudentAccount>(`/classes/${classId}/students`, input);
}

export function updateStudent(id: number, input: UpdateStudentAccount): Promise<StudentAccount> {
  return api.patch<StudentAccount>(`/students/${id}`, input);
}

export function setStudentPassword(id: number, password: string): Promise<void> {
  return api.post(`/students/${id}/password`, { password });
}

export function deleteStudent(id: number): Promise<void> {
  return api.delete<void>(`/students/${id}`);
}

export function bulkStudentAction(
  classId: number,
  input: BulkStudentAction
): Promise<BulkStudentActionResult> {
  return api.post<BulkStudentActionResult>(`/classes/${classId}/students/bulk`, input);
}

export function exportStudents(classId: number): void {
  window.location.href = `/api/v1/classes/${classId}/students/export`;
}

// Raw binary upload, so it bypasses the JSON api helper — but it must still
// unwrap the same `{ data }` envelope the server wraps every response in.
export async function importStudents(classId: number, file: File): Promise<StudentImportResult> {
  const buffer = await file.arrayBuffer();
  const response = await fetch(`/api/v1/classes/${classId}/students/import`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: buffer,
  });

  const json = (await response.json()) as { data?: StudentImportResult; message?: string };

  if (!response.ok || !json.data) {
    throw new Error(json.message ?? 'Import failed');
  }

  return json.data;
}

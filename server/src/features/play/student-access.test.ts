import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { app } from '../../index.js';
import {
  setup,
  makeLecturer,
  makeClass,
  makeStudent,
  makeOpenQuizForClass,
  uniqueId,
} from '../../testing/helpers.js';

// Integration tests over HTTP covering the role model: students log in and
// only see quizzes released to their class; lecturers manage their own
// content; only admins manage lecturers.
describe('user management (HTTP integration)', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await setup();
    server = app.listen(0);
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await new Promise<void>((resolve) => {
      server.closeAllConnections?.();
      resolve();
    });
  });

  beforeEach(async () => {
    await setup();
  });

  async function login(identifier: string, password: string): Promise<string> {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    expect(res.status).toBe(200);
    return res.headers.getSetCookie()[0]?.split(';')[0] ?? '';
  }

  it('logs a student in by username and lists open quizzes for their class', async () => {
    const advisor = await makeLecturer();
    const classId = (await makeClass(advisor)).id;
    const student = await makeStudent(advisor, classId, 'Alice');
    const quiz = await makeOpenQuizForClass(advisor, classId, 'Open Quiz');

    const cookie = await login(student.username, 'studentpass');
    const res = await fetch(`${baseUrl}/api/v1/play/open-quizzes`, {
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { id: number }[] };
    expect(json.data.map((q) => q.id)).toContain(quiz.id);
  });

  it('never returns password_hash from login or me', async () => {
    const advisor = await makeLecturer();
    const classId = (await makeClass(advisor)).id;
    const student = await makeStudent(advisor, classId, 'Alice');

    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: student.username, password: 'studentpass' }),
    });
    const loginJson = JSON.stringify(await loginRes.json());
    expect(loginJson).not.toContain('password_hash');

    const cookie = loginRes.headers.getSetCookie()[0]?.split(';')[0] ?? '';
    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, { headers: { Cookie: cookie } });
    expect(meRes.status).toBe(200);
    const meJson = JSON.stringify(await meRes.json());
    expect(meJson).not.toContain('password_hash');
    void advisor;
  });

  it('blocks students from lecturer routes', async () => {
    const advisor = await makeLecturer();
    const classId = (await makeClass(advisor)).id;
    const student = await makeStudent(advisor, classId, 'Alice');
    const cookie = await login(student.username, 'studentpass');

    const classesRes = await fetch(`${baseUrl}/api/v1/classes`, { headers: { Cookie: cookie } });
    expect(classesRes.status).toBe(403);

    const quizzesRes = await fetch(`${baseUrl}/api/v1/quizzes`, { headers: { Cookie: cookie } });
    expect(quizzesRes.status).toBe(403);

    const usersRes = await fetch(`${baseUrl}/api/v1/users`, { headers: { Cookie: cookie } });
    expect(usersRes.status).toBe(403);
  });

  it('lets any lecturer see the class list but only the advisor edit a roster', async () => {
    const advisor = await makeLecturer();
    const outsider = await makeLecturer();
    const classId = (await makeClass(advisor, 'Advisor Class')).id;

    const outsiderCookie = await login(outsider.email!, 'password123');
    const listRes = await fetch(`${baseUrl}/api/v1/classes`, {
      headers: { Cookie: outsiderCookie },
    });
    expect(listRes.status).toBe(200);
    const list = (await listRes.json()) as { data: { id: number }[] };
    expect(list.data.map((c) => c.id)).toContain(classId);

    const denied = await fetch(`${baseUrl}/api/v1/classes/${classId}/students`, {
      method: 'POST',
      headers: { Cookie: outsiderCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `hacker.${uniqueId('x').toLowerCase()}`, display_name: 'Hax' }),
    });
    expect(denied.status).toBe(403);
  });

  it('lets a lecturer create a quiz and release it to a class they do not advise', async () => {
    const advisor = await makeLecturer();
    const moduleLecturer = await makeLecturer();
    const classId = (await makeClass(advisor, 'Advised Class')).id;

    const cookie = await login(moduleLecturer.email!, 'password123');

    const createRes = await fetch(`${baseUrl}/api/v1/quizzes`, {
      method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Module Quiz' }),
    });
    expect(createRes.status).toBe(201);
    const { data: quiz } = (await createRes.json()) as { data: { id: number } };

    const releaseRes = await fetch(`${baseUrl}/api/v1/quizzes/${quiz.id}/releases`, {
      method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId }),
    });
    expect(releaseRes.status).toBe(200);

    const openRes = await fetch(`${baseUrl}/api/v1/quizzes/${quiz.id}/open`, {
      method: 'POST',
      headers: { Cookie: cookie },
    });
    expect(openRes.status).toBe(200);

    const student = await makeStudent(advisor, classId, 'Alice');
    const studentCookie = await login(student.username, 'studentpass');
    const openQuizRes = await fetch(`${baseUrl}/api/v1/play/open-quizzes`, {
      headers: { Cookie: studentCookie },
    });
    const open = (await openQuizRes.json()) as { data: { id: number }[] };
    expect(open.data.map((q) => q.id)).toContain(quiz.id);

    // Non-owners cannot see or touch the quiz.
    const outsider = await makeLecturer();
    const outsiderCookie = await login(outsider.email!, 'password123');
    const denied = await fetch(`${baseUrl}/api/v1/quizzes/${quiz.id}`, {
      headers: { Cookie: outsiderCookie },
    });
    expect(denied.status).toBe(404);
  });

  it('allows only admins to manage lecturers', async () => {
    const admin = await makeLecturer(true);
    const plain = await makeLecturer();
    const adminCookie = await login(admin.email!, 'password123');
    const plainCookie = await login(plain.email!, 'password123');

    const denied = await fetch(`${baseUrl}/api/v1/users`, { headers: { Cookie: plainCookie } });
    expect(denied.status).toBe(403);

    const ok = await fetch(`${baseUrl}/api/v1/users`, { headers: { Cookie: adminCookie } });
    expect(ok.status).toBe(200);

    const createRes = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'POST',
      headers: { Cookie: adminCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `new.${uniqueId('lect').toLowerCase()}@example.com`,
        password: 'longpassword1',
        display_name: 'Created By Admin',
      }),
    });
    expect(createRes.status).toBe(201);
  });

  it('rejects unauthenticated access to student and lecturer endpoints', async () => {
    const noCookie = await fetch(`${baseUrl}/api/v1/play/open-quizzes`);
    expect(noCookie.status).toBe(401);

    const classesRes = await fetch(`${baseUrl}/api/v1/classes`);
    expect(classesRes.status).toBe(401);

    const usersRes = await fetch(`${baseUrl}/api/v1/users`);
    expect(usersRes.status).toBe(401);
  });
});

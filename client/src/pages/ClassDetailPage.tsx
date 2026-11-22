import { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Class, StudentAccount, PublicUser } from '@elitequest/shared';
import {
  getClass,
  listStudents,
  createStudent,
  updateStudent,
  setStudentPassword,
  deleteStudent,
  bulkStudentAction,
  exportStudents,
  importStudents,
  type BulkStudentActionResult,
} from '../api/classes.js';
import { listCampaigns, createCampaign, deleteCampaign, type Campaign } from '../api/campaigns.js';
import StudentTable, { type BulkAction } from '../components/StudentTable.js';

export default function ClassDetailPage({ user }: { user: PublicUser | null }): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);

  const [class_, setClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<{ row: number; message: string }[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignTitle, setCampaignTitle] = useState('');

  const isAdvisor =
    user?.role === 'lecturer' &&
    (user.is_admin || class_?.advisor_id === user.id);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  async function loadData() {
    try {
      const [classRow, roster, campaignList] = await Promise.all([
        getClass(classId),
        listStudents(classId),
        listCampaigns(classId).catch(() => []),
      ]);
      setClass(classRow);
      setStudents(roster);
      setCampaigns(campaignList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load class');
    }
  }

  async function handleAddStudent(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createStudent(classId, {
        username,
        display_name: displayName,
        password: initialPassword || undefined,
        student_number: studentNumber || undefined,
      });
      setUsername('');
      setDisplayName('');
      setInitialPassword('');
      setStudentNumber('');
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add student');
    }
  }

  async function handleUpdateStudentRow(student: StudentAccount): Promise<boolean> {
    setError(null);
    try {
      await updateStudent(student.id, {
        username: student.username,
        display_name: student.display_name,
        student_number: student.student_number ?? null,
      });
      void loadData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student');
      return false;
    }
  }

  async function handleBulkAction(ids: number[], action: BulkAction): Promise<boolean> {
    if (action === 'delete') {
      const message =
        ids.length === 1
          ? 'Remove this student account? Their past responses are kept anonymously.'
          : `Remove ${ids.length} student accounts? Their past responses are kept anonymously.`;
      if (!confirm(message)) return false;
    }
    setError(null);
    try {
      const result: BulkStudentActionResult = await bulkStudentAction(classId, { ids, action });
      const errorText = result.errors
        .map((e) => `student #${e.id}: ${e.message}`)
        .join(', ');
      setImportResult(
        `Bulk ${action}: ${result.updated} updated, ${result.deleted} deleted` +
          (errorText ? ` — ${errorText}` : '')
      );
      void loadData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk action failed');
      return false;
    }
  }

  async function handleResetPassword(studentIdNum: number) {
    const password = prompt('New password for this student (1-50 characters, symbols and emoji allowed):');
    if (password === null) return;
    if (password.length === 0) {
      setError('Password cannot be empty.');
      return;
    }
    setError(null);
    try {
      await setStudentPassword(studentIdNum, password);
      setImportResult('Password updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set password');
    }
  }

  async function handleToggleActive(student: StudentAccount) {
    setError(null);
    try {
      await updateStudent(student.id, { is_active: !student.is_active });
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student');
    }
  }

  async function handleDeleteStudent(studentIdNum: number) {
    if (!confirm('Remove this student account? Their past responses are kept anonymously.')) return;
    try {
      await deleteStudent(studentIdNum);
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete student');
    }
  }

  async function handleCreateCampaign(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createCampaign({ class_id: classId, title: campaignTitle });
      setCampaignTitle('');
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    }
  }

  async function handleDeleteCampaign(campaignId: number) {
    if (!confirm('Delete this campaign and its playlist?')) return;
    setError(null);
    try {
      await deleteCampaign(campaignId);
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setImportResult(null);
    setImportErrors([]);
    try {
      const result = await importStudents(classId, file);
      setImportResult(`Created ${result.created}, updated ${result.updated}.`);
      setImportErrors(result.errors);
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    }
  }

  if (!class_) {
    return <p>Loading class...</p>;
  }

  return (
    <div>
      <p>
        <Link to="/dashboard">&larr; Back to dashboard</Link>
      </p>
      <h2>{class_.name}</h2>
      <p>
        Class code: <strong>{class_.code}</strong> &nbsp;|&nbsp; Advisor:{' '}
        <strong>{class_.advisor_id === user?.id ? 'you' : class_.advisor_id ?? '—'}</strong>{' '}
        &nbsp;|&nbsp; <Link to={`/classes/${classId}/games`}>Mini-games</Link>
      </p>
      {!isAdvisor && (
        <p style={{ color: 'var(--color-muted)' }}>
          Only the class advisor can manage this roster. You can still release quizzes
          to this class, define quiz groups and run campaigns/games for it.
        </p>
      )}
      {error && <p className="error">{error}</p>}
      {importResult && <p className="success">{importResult}</p>}
      {importErrors.length > 0 && (
        <div className="error">
          <strong>Import errors ({importErrors.length}):</strong>
          <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0 }}>
            {importErrors.map((rowError, index) => (
              <li key={index}>
                Row {rowError.row}: {rowError.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isAdvisor && (
        <>
          <div className="card">
            <h3>Add Student Account</h3>
            <form onSubmit={(e) => { void handleAddStudent(e); }}>
              <label>Username (used to log in)</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g. alice.s1023"
              />
              <label>Display Name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
              <label>Initial Password (optional — 1-50 characters, symbols and emoji allowed)</label>
              <input
                type="text"
                value={initialPassword}
                onChange={(e) => setInitialPassword(e.target.value)}
                maxLength={50}
                placeholder="Leave blank — student can't log in until you set one"
              />
              <label>Student Number (optional)</label>
              <input value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} />
              <button type="submit">Add Student</button>
            </form>
          </div>

          <div className="card">
            <h3>Import / Export Roster</h3>
            <p style={{ color: 'var(--color-muted)', marginTop: 0 }}>
              XLSX columns: <code>username</code>, <code>display_name</code>,{' '}
              <code>student_number</code>, <code>password</code> (optional). Headers are matched
              case-insensitively regardless of spacing. Passwords: 1-50 characters, any letters,
              numbers, symbols or emoji — a blank password means the student can't log in until you
              set one. Tip: format the password column as <strong>Text</strong> in Excel so leading
              zeros survive. Existing usernames in this class are updated. The exported file always
              has an empty password column (passwords are stored securely and can't be exported).
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label className="button">
                Import XLSX
                <input type="file" accept=".xlsx" onChange={(e) => { void handleImport(e); }} hidden />
              </label>
              <button onClick={() => exportStudents(classId)}>Export XLSX</button>
            </div>
          </div>
        </>
      )}

      <div className="card">
        <h3>Campaigns</h3>
        <p style={{ color: 'var(--color-muted)', marginTop: 0 }}>
          A campaign is a playlist of quizzes for this class — results roll up cumulatively.
        </p>
        <form onSubmit={(e) => { void handleCreateCampaign(e); }} className="inline-form">
          <input
            placeholder="Campaign name (e.g. Semester Series)"
            value={campaignTitle}
            onChange={(e) => setCampaignTitle(e.target.value)}
            required
          />
          <button type="submit">Create Campaign</button>
        </form>
        {campaigns.length === 0 ? (
          <p>No campaigns yet.</p>
        ) : (
          <ul className="card-list" style={{ listStyle: 'none', padding: 0 }}>
            {campaigns.map((campaign) => (
              <li key={campaign.id} className="card">
                <div className="row-between">
                  <strong>
                    <Link to={`/campaigns/${campaign.id}`}>{campaign.title}</Link>
                  </strong>
                  <button onClick={() => { void handleDeleteCampaign(campaign.id); }} className="secondary">
                    Delete
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <Link to={`/campaigns/${campaign.id}`} className="button secondary">
                    Playlist
                  </Link>
                  <Link to={`/campaigns/${campaign.id}/results`} className="button secondary">
                    Results
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h3>Students ({students.length})</h3>
      <div className="card">
        <StudentTable
          students={students}
          isAdvisor={isAdvisor}
          onUpdate={handleUpdateStudentRow}
          onSetPassword={handleResetPassword}
          onToggleActive={handleToggleActive}
          onDelete={handleDeleteStudent}
          onBulkAction={handleBulkAction}
        />
      </div>
    </div>
  );
}

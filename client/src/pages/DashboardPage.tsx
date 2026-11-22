import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  listClasses,
  createClass,
  deleteClass,
  type ClassSummary,
} from '../api/classes.js';
import type { PublicUser } from '@elitequest/shared';

export default function DashboardPage({ user }: { user: PublicUser | null }): JSX.Element {
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadClasses();
  }, []);

  async function loadClasses() {
    try {
      const data = await listClasses();
      setClasses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createClass({
        name,
        description: description || undefined,
      });
      setName('');
      setDescription('');
      void loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this class? All its students, quizzes releases, campaigns and games go with it.')) return;
    try {
      await deleteClass(id);
      void loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>Classes</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {user?.role === 'lecturer' && (
            <>
              <Link to="/banks" className="button">
                Question Banks
              </Link>
              {user.is_admin && (
                <Link to="/users" className="button">
                  Manage Lecturers
                </Link>
              )}
            </>
          )}
          {user?.is_admin && (
            <Link to="/settings" className="button">
              AI Settings
            </Link>
          )}
          <Link to="/quizzes" className="button">
            Manage Quizzes
          </Link>
        </div>
      </div>
      {error && <p className="error">{error}</p>}

      {user?.role === 'student' ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Welcome, {user.display_name}</h3>
          <p>
            Go to your quizzes to see what your instructors have opened for your class.
          </p>
          <Link to="/play" className="button">
            My Quizzes
          </Link>
        </div>
      ) : (
        <>
          <div className="card">
            <h3>Create Class</h3>
            <form onSubmit={(e) => { void handleCreate(e); }}>
              <label htmlFor="className">Name</label>
              <input
                id="className"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label htmlFor="classDesc">Description</label>
              <input
                id="classDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
              />
              <button type="submit">Create Class</button>
            </form>
            <p style={{ color: 'var(--color-muted)', marginBottom: 0 }}>
              You become the Class Advisor of classes you create — only you (or an admin)
              can manage their rosters.
            </p>
          </div>

          {classes.length === 0 ? (
            <p>No classes yet.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1rem',
              }}
            >
              {classes.map((cls) => (
                <div key={cls.id} className="card card-interactive">
                  <h3 style={{ marginTop: 0 }}>
                    <Link to={`/classes/${cls.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {cls.name}
                    </Link>
                  </h3>
                  <p style={{ fontSize: '1.1rem' }}>
                    Code: <strong>{cls.code}</strong>
                  </p>
                  <p style={{ color: 'var(--color-muted)' }}>
                    Advisor: {cls.advisor_name ?? '—'} · {cls.student_count ?? 0} students
                  </p>
                  {cls.description && <p style={{ color: 'var(--color-muted)' }}>{cls.description}</p>}
                  <div style={{ marginTop: '1rem' }}>
                    <button onClick={() => handleDelete(cls.id)} className="secondary">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

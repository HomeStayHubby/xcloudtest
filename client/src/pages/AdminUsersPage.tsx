import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  listUsers,
  createLecturer,
  updateLecturer,
  resetLecturerPassword,
  type PublicUser,
} from '../api/users.js';

export default function AdminUsersPage(): JSX.Element {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setUsers(await listUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lecturers');
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await createLecturer({ email, password, display_name: displayName, is_admin: isAdmin });
      setEmail('');
      setDisplayName('');
      setPassword('');
      setIsAdmin(false);
      setMessage('Lecturer created.');
      void loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lecturer');
    }
  }

  async function handleResetPassword(user: PublicUser) {
    const password = prompt(`New password for ${user.email} (min 8 characters):`);
    if (!password) return;
    setError(null);
    try {
      await resetLecturerPassword(user.id, password);
      setMessage('Password updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    }
  }

  async function handleToggleAdmin(user: PublicUser) {
    setError(null);
    try {
      await updateLecturer(user.id, { is_admin: !user.is_admin });
      void loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lecturer');
    }
  }

  async function handleToggleActive(user: PublicUser) {
    setError(null);
    try {
      await updateLecturer(user.id, { is_active: !user.is_active });
      void loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lecturer');
    }
  }

  return (
    <div>
      <p>
        <Link to="/dashboard">&larr; Back to dashboard</Link>
      </p>
      <h2>Lecturers</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Create Lecturer</h3>
        <form onSubmit={(e) => { void handleCreate(e); }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Display Name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          <label>Password (min 8 characters)</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <label>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            Admin privilege (can manage lecturers and all classes)
          </label>
          <button type="submit">Create Lecturer</button>
        </form>
      </div>

      {users.length === 0 ? (
        <p>No lecturers yet.</p>
      ) : (
        <ul className="card-list" style={{ listStyle: 'none', padding: 0 }}>
          {users.map((user) => (
            <li key={user.id} className="card">
              <div className="row-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <strong>{user.display_name}</strong>{' '}
                  <span style={{ color: 'var(--color-muted)' }}>{user.email}</span>{' '}
                  {user.is_admin && <span className="badge badge-open">admin</span>}{' '}
                  {!user.is_active && <span className="badge badge-draft">inactive</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => { void handleResetPassword(user); }}>Reset Password</button>
                  <button onClick={() => { void handleToggleAdmin(user); }}>
                    {user.is_admin ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                  <button onClick={() => { void handleToggleActive(user); }}>
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

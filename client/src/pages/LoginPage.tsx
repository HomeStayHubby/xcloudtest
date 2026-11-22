import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth.js';
import Logo from '../components/Logo.js';

interface LoginPageProps {
  onLogoClick: (event: React.MouseEvent) => void;
}

export default function LoginPage({ onLogoClick }: LoginPageProps): JSX.Element {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await loginUser({ identifier, password });
      if (result.user.role === 'student') {
        navigate('/play');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Logo size="login" onClick={onLogoClick} />
        </div>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Login</h2>
        <p style={{ color: 'var(--color-muted)' }}>
          Lecturers log in with their email, students with their username.
        </p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={(e) => { void handleSubmit(e); }} style={{ textAlign: 'left' }}>
          <label htmlFor="identifier">Email or Username</label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
            disabled={loading}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
          />

          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

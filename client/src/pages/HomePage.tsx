import { Link } from 'react-router-dom';

export default function HomePage(): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: '1.5rem',
      }}
    >
      <h2 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', margin: 0 }}>Welcome to ELITEQuest</h2>
      <p style={{ fontSize: '1.25rem', color: 'var(--color-muted)', margin: 0 }}>
        Gamified quizzing for your classroom.
      </p>
      <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/login" className="button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
          Login
        </Link>
        <Link
          to="/play"
          className="button secondary"
          style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
        >
          My Quizzes
        </Link>
      </nav>
    </div>
  );
}

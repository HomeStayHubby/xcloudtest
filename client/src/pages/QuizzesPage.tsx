import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  listQuizzes,
  createQuiz,
  deleteQuiz,
  openQuiz,
  closeQuiz,
  type QuizDetail,
} from '../api/quizzes.js';

export default function QuizzesPage(): JSX.Element {
  const [quizzes, setQuizzes] = useState<QuizDetail[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadQuizzes();
  }, []);

  async function loadQuizzes() {
    try {
      const data = await listQuizzes();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createQuiz({ title });
      setTitle('');
      void loadQuizzes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this quiz?')) return;
    try {
      await deleteQuiz(id);
      void loadQuizzes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz');
    }
  }

  async function handleToggleStatus(quiz: QuizDetail) {
    try {
      if (quiz.status === 'open') {
        await closeQuiz(quiz.id);
      } else {
        await openQuiz(quiz.id);
      }
      void loadQuizzes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/dashboard" className="button secondary">
          &larr; Back to dashboard
        </Link>
        <h2 style={{ margin: 0 }}>Quizzes</h2>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Create Quiz</h3>
        <form onSubmit={(e) => { void handleCreate(e); }}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Week 3 Review" />
          <button type="submit">Create Quiz</button>
        </form>
        <p style={{ color: 'var(--color-muted)', marginBottom: 0 }}>
          Release the quiz to one or more classes from its edit page; students of those
          classes see it while it is open.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <p>No quizzes yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="card card-interactive">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>
                  <Link to={`/quizzes/${quiz.id}/edit`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {quiz.title}
                  </Link>
                </h3>
                <StatusBadge status={quiz.status} />
              </div>
              <p style={{ color: 'var(--color-muted)', margin: '0.5rem 0 1rem' }}>
                Released to:{' '}
                {quiz.releases.length === 0 ? (
                  <strong>nothing yet</strong>
                ) : (
                  <strong>{quiz.releases.map((r) => r.class_name ?? `#${r.class_id}`).join(', ')}</strong>
                )}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => { void handleToggleStatus(quiz); }}>
                  {quiz.status === 'open' ? 'Close' : 'Open'}
                </button>
                <Link to={`/quizzes/${quiz.id}/edit`} className="button secondary">
                  Edit
                </Link>
                <Link to={`/quizzes/${quiz.id}/run`} className="button success">
                  Present
                </Link>
                <Link to={`/quizzes/${quiz.id}/results`} className="button secondary">
                  Results
                </Link>
                <button onClick={() => handleDelete(quiz.id)} className="secondary">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'open' ? 'badge-open' : status === 'draft' ? 'badge-draft' : 'badge-closed';
  return <span className={`badge ${className}`}>{status}</span>;
}

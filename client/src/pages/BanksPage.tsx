import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  listBanks,
  createBank,
  deleteBank,
  type QuestionBankDetail,
} from '../api/question-banks.js';

export default function BanksPage(): JSX.Element {
  const [banks, setBanks] = useState<QuestionBankDetail[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadBanks();
  }, []);

  async function loadBanks() {
    try {
      setBanks(await listBanks());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load question banks');
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createBank({ title, description: description || undefined });
      setTitle('');
      setDescription('');
      void loadBanks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bank');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this bank and its questions? Quizzes that copied its questions are unaffected.')) return;
    try {
      await deleteBank(id);
      void loadBanks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bank');
    }
  }

  return (
    <div>
      <p>
        <Link to="/dashboard">&larr; Back to dashboard</Link>
      </p>
      <h2>Question Banks</h2>
      <p style={{ color: 'var(--color-muted)' }}>
        Banks hold reusable questions. Adding a bank question to a quiz copies it into
        the quiz, so the quiz never changes when the bank changes.
      </p>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Create Bank</h3>
        <form onSubmit={(e) => { void handleCreate(e); }}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Sec 2 Algebra" />
          <label>Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
          <button type="submit">Create Bank</button>
        </form>
      </div>

      {banks.length === 0 ? (
        <p>No banks yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {banks.map((bank) => (
            <div key={bank.id} className="card">
              <div className="row-between">
                <h3 style={{ margin: 0 }}>
                  <Link to={`/banks/${bank.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {bank.title}
                  </Link>
                </h3>
                <span className="badge badge-draft">{bank.question_count ?? 0} questions</span>
              </div>
              {bank.description && <p style={{ color: 'var(--color-muted)' }}>{bank.description}</p>}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link to={`/banks/${bank.id}`} className="button secondary">
                  Manage Questions
                </Link>
                <button onClick={() => handleDelete(bank.id)} className="secondary">
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

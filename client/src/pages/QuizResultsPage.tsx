import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuizResults, exportQuizResults, type QuizResults } from '../api/results.js';
import { setResponseScore, setQuestionScores } from '../api/responses.js';
import { MarkdownText } from '../components/MarkdownText.js';

const MANUALLY_SCORABLE_TYPES = ['word_cloud', 'brainstorming'];

function isManuallyScorable(type: string): boolean {
  return MANUALLY_SCORABLE_TYPES.includes(type);
}

export default function QuizResultsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const quizId = Number(id);
  const [classId, setClassId] = useState<number | null>(null);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, [quizId, classId]);

  async function loadResults() {
    try {
      const data = await getQuizResults(quizId, classId ?? undefined);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
    }
  }

  async function handleSaveResponseScore(responseId: number, score: number) {
    await setResponseScore(responseId, score);
    await loadResults();
  }

  async function handleBulkScore(questionId: number, score: number) {
    const updated = await setQuestionScores(questionId, score);
    setNotice(`Assigned ${score} point(s) to ${updated} submission(s).`);
    await loadResults();
  }

  if (error) {
    return (
      <div className="card">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!results) {
    return <p>Loading results...</p>;
  }

  function formatAnswer(raw: string, type: string): string {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        if (type === 'brainstorming') {
          // Upvotes are stored inline as "idea|count"; show the idea text only.
          return parsed.map((item) => String(item).replace(/\|\d+$/, '')).join(', ');
        }
        return parsed.join(', ');
      }
      if (typeof parsed === 'object' && parsed !== null) return JSON.stringify(parsed);
      return String(parsed);
    } catch {
      return raw;
    }
  }

  return (
    <div>
      <p>
        <Link to="/quizzes">&larr; Back to quizzes</Link>
      </p>
      <h2>Results: {results.quiz_title}</h2>
      <p style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          aria-label="Filter results by class"
          value={classId ?? ''}
          onChange={(e) => setClassId(e.target.value === '' ? null : Number(e.target.value))}
        >
          <option value="">All classes</option>
          {results.classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button onClick={() => exportQuizResults(quizId, classId ?? undefined)}>
          Export XLSX
        </button>
      </p>

      <div className="card">
        <h3>Question Summary</h3>
        {notice && <p style={{ color: 'var(--color-muted)' }}>{notice}</p>}
        {results.summary.length === 0 ? (
          <p>No responses yet.</p>
        ) : (
          <div className="table-scroll"><table className="data-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>#</th>
                <th style={{ textAlign: 'left' }}>Question</th>
                <th>Type</th>
                <th>Mode</th>
                <th style={{ textAlign: 'right' }}>Responses</th>
                <th style={{ textAlign: 'right' }}>Avg Score</th>
                <th style={{ textAlign: 'right' }}>Correct %</th>
                <th style={{ textAlign: 'left' }}>Score All</th>
              </tr>
            </thead>
            <tbody>
              {results.summary.map((s) => (
                <tr key={s.question_id}>
                  <td>{s.order_index + 1}</td>
                  <td><MarkdownText tag="span" text={s.prompt} /></td>
                  <td>{s.type}</td>
                  <td>{s.answer_mode}</td>
                  <td style={{ textAlign: 'right' }}>{s.response_count}</td>
                  <td style={{ textAlign: 'right' }}>
                    {s.average_score !== null ? s.average_score.toFixed(2) : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {s.correct_rate !== null ? `${Math.round(s.correct_rate * 100)}%` : '—'}
                  </td>
                  <td>
                    {isManuallyScorable(s.type) ? (
                      <ScoreInput
                        key={`bulk-${s.question_id}-${s.response_count}-${s.average_score ?? 'none'}`}
                        initial={null}
                        placeholder="All"
                        onSave={(score) => handleBulkScore(s.question_id, score)}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
        <p style={{ color: 'var(--color-muted)', marginBottom: 0 }}>
          Word Cloud and Brainstorming submissions are not auto-scored. Enter a score under
          &ldquo;Score All&rdquo; to grade every submission for that question, or grade individual
          submissions in the table below. &ldquo;Score All&rdquo; overwrites individual scores.
        </p>
      </div>

      <div className="card">
        <h3>All Responses</h3>
        {results.responses.length === 0 ? (
          <p>No responses yet.</p>
        ) : (
          <div className="table-scroll"><table className="data-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Question</th>
                <th style={{ textAlign: 'left' }}>Student</th>
                {results.class_id === null && <th style={{ textAlign: 'left' }}>Class</th>}
                <th style={{ textAlign: 'left' }}>Group</th>
                <th style={{ textAlign: 'left' }}>Answer</th>
                <th style={{ textAlign: 'right' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {results.responses.map((r) => (
                <tr key={r.response_id}>
                  <td>
                    #{r.order_index + 1}: <MarkdownText tag="span" text={r.prompt} />
                  </td>
                  <td>{r.student_name ?? '—'}</td>
                  {results.class_id === null && <td>{r.class_name ?? '—'}</td>}
                  <td>{r.group_name ?? '—'}</td>
                  <td>{formatAnswer(r.answer, r.type)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {isManuallyScorable(r.type) ? (
                      <ScoreInput
                        key={`row-${r.response_id}-${r.score ?? 'none'}`}
                        initial={r.score}
                        onSave={(score) => handleSaveResponseScore(r.response_id, score)}
                      />
                    ) : (
                      r.score ?? '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
        <p style={{ color: 'var(--color-muted)', marginBottom: 0 }}>
          While the quiz is open, students can change their Word Cloud / Brainstorming submission,
          which resets its score. Grades are stable once the quiz is closed.
        </p>
      </div>
    </div>
  );
}

function ScoreInput({
  initial,
  placeholder,
  onSave,
}: {
  initial: number | null;
  placeholder?: string;
  onSave: (score: number) => Promise<void>;
}): JSX.Element {
  const [value, setValue] = useState(initial === null ? '' : String(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const score = Number(value);
    if (value.trim() === '' || Number.isNaN(score) || score < 0) {
      setError('Enter a score of 0 or more');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(score);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save score');
    } finally {
      setSaving(false);
    }
  }

  return (
    <span style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
      <input
        type="number"
        min={0}
        step={0.5}
        style={{ width: '5rem', textAlign: 'right' }}
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        disabled={saving}
      />
      <button
        type="button"
        className="secondary"
        onClick={() => { void save(); }}
        disabled={saving}
      >
        {saving ? '...' : 'Set'}
      </button>
      {error && <span className="error">{error}</span>}
    </span>
  );
}

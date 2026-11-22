import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Question } from '@elitequest/shared';
import {
  getBank,
  listBankQuestions,
  createBankQuestion,
  type QuestionBankDetail,
} from '../api/question-banks.js';
import { deleteQuestion } from '../api/quizzes.js';
import { useQuestionEditor, QuestionTypeFields, BloomLevelSelect } from '../components/questionEditors.js';
import { MarkdownText } from '../components/MarkdownText.js';

export default function BankDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const bankId = Number(id);

  const [bank, setBank] = useState<QuestionBankDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [points, setPoints] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const qe = useQuestionEditor();

  useEffect(() => {
    void loadData();
  }, [bankId]);

  async function loadData() {
    try {
      const [bankRow, questionRows] = await Promise.all([getBank(bankId), listBankQuestions(bankId)]);
      setBank(bankRow);
      setQuestions(questionRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bank');
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createBankQuestion(bankId, {
        type: qe.type,
        prompt: qe.prompt,
        data: qe.buildData(),
        points,
        answer_mode: 'individual',
        bloom_level: qe.bloomLevel === '' ? null : qe.bloomLevel,
      });
      qe.reset();
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
    }
  }

  async function handleDelete(questionId: number) {
    if (!confirm('Delete this bank question?')) return;
    try {
      await deleteQuestion(questionId);
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question');
    }
  }

  if (!bank) {
    return <p>Loading bank...</p>;
  }

  return (
    <div>
      <p>
        <Link to="/banks">&larr; All banks</Link>{' '}
        <Link to={`/generate?bank=${bankId}`} className="button">
          Generate with AI
        </Link>
      </p>
      <h2>{bank.title}</h2>
      {bank.description && <p style={{ color: 'var(--color-muted)' }}>{bank.description}</p>}
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Add Question</h3>
        <form onSubmit={(e) => { void handleCreate(e); }}>
          <QuestionTypeFields editor={qe} />
          <BloomLevelSelect value={qe.bloomLevel} onChange={qe.setBloomLevel} />

          <label>Points</label>
          <input
            type="number"
            min={1}
            step={0.5}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
          />
          <button type="submit">Add to Bank</button>
        </form>
        <p style={{ color: 'var(--color-muted)', marginBottom: 0 }}>
          Word Cloud and Brainstorming are live engagement types (unscored by default; you can
          assign points manually on the quiz results page).
        </p>
      </div>

      <h3>Questions ({questions.length})</h3>
      {questions.length === 0 ? (
        <p>No questions in this bank yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {questions.map((question) => (
            <li key={question.id} className="card row-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>
                <span className="badge badge-draft">{question.type}</span>{' '}
                <MarkdownText tag="span" text={question.prompt} />
              </span>
              <button onClick={() => { void handleDelete(question.id); }} className="secondary">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

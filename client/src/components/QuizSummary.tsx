import type { MyQuizResults, MyResultsItem } from '@elitequest/shared';
import { MarkdownText } from './MarkdownText.js';

function resultBadge(item: MyResultsItem): JSX.Element {
  if (item.score === null) {
    return (
      <span className="badge" style={{ background: 'var(--color-muted)', color: 'white' }}>
        Pending grading
      </span>
    );
  }
  if (item.correct) {
    return <span className="badge badge-open">Correct</span>;
  }
  if (item.score > 0) {
    return <span className="badge" style={{ background: '#d97706', color: 'white' }}>Partial</span>;
  }
  return <span className="badge badge-closed">Incorrect</span>;
}

function SummaryItem({ item }: { item: MyResultsItem }): JSX.Element {
  return (
    <li
      className="card"
      style={{
        padding: '0.75rem',
        marginBottom: '0.75rem',
        borderLeft: `4px solid ${
          item.score === null
            ? 'var(--color-muted)'
            : item.correct
              ? 'var(--color-primary)'
              : '#dc2626'
        }`,
      }}
    >
      <div className="row-between" style={{ alignItems: 'flex-start', gap: '0.5rem' }}>
        <MarkdownText tag="span" text={item.prompt} />
        {resultBadge(item)}
      </div>
      <p style={{ margin: '0.5rem 0 0' }}>
        <strong>Your answer:</strong> {item.my_answer_display ?? 'Not answered'}
        {item.score !== null && (
          <span style={{ color: 'var(--color-muted)' }}> (+{item.score} pts)</span>
        )}
      </p>
      {item.correct_answer !== null && (
        <p style={{ margin: '0.25rem 0 0' }}>
          <strong>Correct answer:</strong> {item.correct_answer}
        </p>
      )}
    </li>
  );
}

export default function QuizSummary({
  summary,
  onBack,
}: {
  summary: MyQuizResults;
  onBack: () => void;
}): JSX.Element {
  const graded = summary.items.filter((item) => item.score !== null);
  const correctCount = graded.filter((item) => item.correct).length;
  const percent =
    summary.points_possible > 0
      ? Math.round((summary.total_score / summary.points_possible) * 100)
      : null;

  return (
    <div className="card">
      <h2>Quiz Complete!</h2>
      <p style={{ color: 'var(--color-muted)' }}>{summary.quiz_title}</p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          margin: '1rem 0',
          padding: '0.75rem',
          background: '#f8fafc',
          borderRadius: '0.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {summary.total_score} / {summary.points_possible} pts
          </div>
          {percent !== null && <div style={{ color: 'var(--color-muted)' }}>{percent}%</div>}
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {correctCount} / {graded.length}
          </div>
          <div style={{ color: 'var(--color-muted)' }}>correct</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {summary.answered} / {summary.total_questions}
          </div>
          <div style={{ color: 'var(--color-muted)' }}>answered</div>
        </div>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {summary.items.map((item) => (
          <SummaryItem key={item.question_id} item={item} />
        ))}
      </ul>

      <button onClick={onBack}>Back to Quizzes</button>
    </div>
  );
}

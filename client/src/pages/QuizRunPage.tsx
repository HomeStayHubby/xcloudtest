import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSocket } from '../api/socket.js';
import {
  getQuiz,
  listQuestions,
  openQuiz,
  closeQuiz,
  advanceQuizPacing,
  retreatQuizPacing,
  type Question,
  type QuizDetail,
} from '../api/quizzes.js';
import { getQuizResults, type QuizResults } from '../api/results.js';
import { getAggregation, upvoteIdea, type AggregationData } from '../api/responses.js';
import type { QuizScoreboard } from '@elitequest/shared';
import LiveWordCloud from '../components/LiveWordCloud.js';
import BrainstormBoard, { authorColor } from '../components/BrainstormBoard.js';
import { MarkdownText } from '../components/MarkdownText.js';

export default function QuizRunPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const quizId = Number(id);

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [aggregation, setAggregation] = useState<AggregationData | null>(null);
  const [scoreboard, setScoreboard] = useState<QuizScoreboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [q, qs] = await Promise.all([getQuiz(quizId), listQuestions(quizId)]);
      setQuiz(q);
      setQuestions(qs);

      if (q.settings.paced) {
        const pacing = await fetch(`/api/v1/play/quiz/${quizId}/pacing`, {
          credentials: 'include',
        }).then((r) => r.json() as Promise<{ data: { current_index: number } }>);
        setActiveIndex(pacing.data.current_index);
      }

      setResults(await getQuizResults(quizId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    }
  }, [quizId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!quiz) return;
    const socket = getSocket();
    socket.emit('join-quiz', quizId);
    socket.emit('get-scoreboard', quizId);

    const refresh = () => {
      void refreshCurrent();
      void getQuizResults(quizId).then(setResults).catch(() => undefined);
    };

    socket.on('scoreboard-update', (sb: QuizScoreboard) => {
      if (sb.quiz_id === quizId) {
        setScoreboard(sb);
        refresh();
      }
    });
    socket.on('response-update', (payload: { questionId: number }) => {
      if (payload.questionId === questions[activeIndex]?.id) {
        void refreshCurrent();
      }
    });
    socket.on('pacing-update', (payload: { quiz_id: number; current_index: number }) => {
      if (payload.quiz_id === quizId) {
        setActiveIndex(payload.current_index);
      }
    });
    socket.on('game-spin', () => {
      // Handled elsewhere for UI banner
    });

    return () => {
      socket.off('scoreboard-update');
      socket.off('response-update');
      socket.off('pacing-update');
      socket.off('game-spin');
      socket.emit('leave-quiz', quizId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, quizId, activeIndex]);

  const question = questions[activeIndex];

  const refreshCurrent = useCallback(async () => {
    if (!question) return;
    const data = await getAggregation(question.id).catch(() => null);
    if (data) setAggregation(data);
  }, [question]);

  useEffect(() => {
    setAggregation(null);
    void refreshCurrent();
  }, [refreshCurrent]);

  async function handleAdvance() {
    try {
      const result = await advanceQuizPacing(quizId);
      setActiveIndex(result.current_index);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to advance');
    }
  }

  async function handleRetreat() {
    try {
      const result = await retreatQuizPacing(quizId);
      setActiveIndex(result.current_index);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retreat');
    }
  }

  async function handleOpen() {
    try {
      await openQuiz(quizId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open quiz');
    }
  }

  async function handleClose() {
    if (!confirm('Close this quiz? Students will no longer be able to answer.')) return;
    try {
      await closeQuiz(quizId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close quiz');
    }
  }

  if (error) return <div className="card"><p className="error">{error}</p></div>;
  if (!quiz) return <p>Loading session...</p>;
  if (!question) return <p>No questions yet — add some first.</p>;

  const summary = results?.summary.find((s) => s.question_id === question.id);

  return (
    <div>
      <p>
        <Link to="/quizzes">&larr; Back to quizzes</Link>
      </p>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>{quiz.title}</h2>
          <p style={{ margin: 0 }}>
            Status: <strong>{quiz.status}</strong>
            {quiz.releases.length > 0 && (
              <>
                {' '}
                | Released to:{' '}
                {quiz.releases.map((r) => r.class_name ?? `#${r.class_id}`).join(', ')}
              </>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {quiz.status === 'open' ? (
            <button onClick={() => void handleClose()}>Close Quiz</button>
          ) : (
            <button onClick={() => void handleOpen()}>Open Quiz</button>
          )}
          <Link to={`/quizzes/${quizId}/results`} className="button">
            Full Results
          </Link>
        </div>
      </div>

      {quiz.status !== 'open' && (
        <div className="card" style={{ borderColor: '#f59e0b', background: '#fffbeb' }}>
          <p style={{ margin: 0 }}>
            <strong>This quiz is not open.</strong> Students can&apos;t see or answer it yet —
            click &quot;Open Quiz&quot; when you&apos;re ready to start.
          </p>
        </div>
      )}

      {quiz.settings.paced && (
        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => void handleRetreat()} disabled={activeIndex === 0}>
            ← Previous
          </button>
          <strong>
            {activeIndex + 1} / {questions.length}
          </strong>
          <button
            onClick={() => void handleAdvance()}
            disabled={activeIndex >= questions.length - 1}
          >
            Next →
          </button>
          <span style={{ marginLeft: 'auto', color: 'var(--color-muted)' }}>Paced mode</span>
        </div>
      )}
      {!quiz.settings.paced && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setActiveIndex(index)}
              style={{ fontWeight: index === activeIndex ? 'bold' : 'normal' }}
            >
              Q{index + 1}
            </button>
          ))}
        </div>
      )}

      <div className="two-col">
        <div>
          <div className="card">
            <h3>
              Q{activeIndex + 1}: <MarkdownText tag="span" text={question.prompt} />
            </h3>
            <p style={{ color: 'var(--color-muted)' }}>
              {question.type} | {question.answer_mode} | {question.points} pts
              {question.time_limit_seconds ? ` | Timer: ${question.time_limit_seconds}s` : ''}
            </p>
            {summary && (
              <p>
                <strong>{summary.response_count}</strong> response{summary.response_count !== 1 ? 's' : ''}
                {summary.correct_rate !== null && (
                  <> ({Math.round(summary.correct_rate * 100)}% correct)</>
                )}
              </p>
            )}
            {aggregation?.type === 'word_cloud' && <WordCloudPanel data={aggregation} />}
            {aggregation?.type === 'brainstorming' && (
              <BrainstormPanel
                data={aggregation}
                questionId={question.id}
                onUpvote={refreshCurrent}
              />
            )}
          </div>
          <QuestionContentPreview question={question} />
        </div>

        <div className="card">
          <h3>Scoreboard</h3>
          {scoreboard && (scoreboard.groups.length > 0 || scoreboard.individuals.length > 0) ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {(scoreboard.groups.length > 0 ? scoreboard.groups : scoreboard.individuals).map(
                (entry, index) => (
                  <li
                    key={entry.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.4rem 0',
                      borderTop: index > 0 ? '1px solid var(--color-border)' : 'none',
                      fontWeight: index === 0 ? 'bold' : 'normal',
                    }}
                  >
                    <span style={{ color: index === 0 ? '#2563eb' : undefined }}>
                      {index + 1}. {entry.name}
                    </span>
                    <span>{entry.total_score} pts</span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p>No scores yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionContentPreview({ question }: { question: Question }) {
  const data = question.data;

  if (data.type === 'mcq_single' || data.type === 'mcq_multi') {
    return (
      <div className="card">
        <h4>Options</h4>
        <ul>
          {data.options.map((o) => (
            <li key={o.id}>{o.text}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (data.type === 'matching') {
    return (
      <div className="card">
        <h4>Matching pairs</h4>
        <ul>
          {data.left_items.map((item) => (
            <li key={item.id}>{item.text}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (data.type === 'grouping') {
    return (
      <div className="card">
        <h4>Items</h4>
        <ul>
          {data.items.map((item) => (
            <li key={item.id}>{item.text}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (data.type === 'fill_blanks') {
    return (
      <div className="card">
        <p>
          {data.segments.map((seg, i) => (
            <span key={i}>{seg.blank ? ' ____ ' : seg.text}</span>
          ))}
        </p>
      </div>
    );
  }

  return null;
}

function WordCloudPanel({ data }: { data: Extract<AggregationData, { type: 'word_cloud' }> }): JSX.Element {
  return <LiveWordCloud words={data.words} />;
}

function BrainstormPanel({
  data,
  questionId,
  onUpvote,
}: {
  data: Extract<AggregationData, { type: 'brainstorming' }>;
  questionId: number;
  onUpvote: () => void;
}): JSX.Element {
  async function handleUpvote(idea: string) {
    try {
      await upvoteIdea(questionId, idea);
      onUpvote();
    } catch (err) {
      console.error(err);
    }
  }

  const notes = data.ideas.map((idea) => ({
    idea: idea.idea,
    count: idea.count,
    upvotes: idea.upvotes,
    submitters: idea.submitters ?? [],
    color: authorColor(idea.submitters?.[0] ?? idea.idea),
    authorName: idea.submitters?.[0] ?? null,
  }));

  return <BrainstormBoard notes={notes} onUpvote={(idea) => void handleUpvote(idea)} />;
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSocket } from '../api/socket.js';
import { getAggregation, upvoteIdea, type AggregationData } from '../api/responses.js';
import type { QuizScoreboard } from '@elitequest/shared';
import LiveWordCloud from '../components/LiveWordCloud.js';
import BrainstormBoard, { authorColor } from '../components/BrainstormBoard.js';
import { MarkdownText } from '../components/MarkdownText.js';
import {
  listQuestions,
  getQuiz,
  advanceQuizPacing,
  retreatQuizPacing,
  type Question,
  type QuizDetail,
} from '../api/quizzes.js';

export default function LiveDisplayPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const quizId = Number(id);
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [aggregation, setAggregation] = useState<AggregationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pacingIndex, setPacingIndex] = useState(0);
  const [scoreboard, setScoreboard] = useState<QuizScoreboard | null>(null);
  const [gameSpin, setGameSpin] = useState<{ segment: string } | null>(null);

  useEffect(() => {
    void loadData();
  }, [quizId]);

  async function loadData() {
    try {
      const [q, qs] = await Promise.all([getQuiz(quizId), listQuestions(quizId)]);
      setQuiz(q);
      setQuestions(qs);

      if (q.settings.paced) {
        const state = await fetch(`/api/v1/play/quiz/${quizId}/pacing`, {
          credentials: 'include',
        }).then((r) => r.json() as Promise<{ data: { current_index: number } }>);
        setPacingIndex(state.data.current_index);
        setActiveIndex(state.data.current_index);
      }

      const socket = getSocket();
      socket.emit('join-quiz', quizId);
      socket.emit('get-scoreboard', quizId);
      socket.on('scoreboard-update', (sb: QuizScoreboard) => {
        if (sb.quiz_id === quizId) {
          setScoreboard(sb);
        }
      });
      socket.on('game-spin', (payload: { segment: string }) => {
        setGameSpin({ segment: payload.segment });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
  }

  useEffect(() => {
    if (questions.length === 0) return;
    const question = questions[activeIndex];
    if (!question) return;
    const socket = getSocket();
    socket.emit('watch-question', question.id);
    socket.on('response-update', () => {
      void refreshAggregation(question.id);
    });

    if (!quiz?.settings.paced) {
      socket.on('pacing-update', (payload: { quiz_id: number; current_index: number }) => {
        if (payload.quiz_id === quizId) {
          setPacingIndex(payload.current_index);
          setActiveIndex(payload.current_index);
        }
      });
    }

    void refreshAggregation(question.id);

    return () => {
      socket.emit('unwatch-question', question.id);
      socket.off('response-update');
      socket.off('pacing-update');
      socket.off('scoreboard-update');
      socket.off('game-spin');
    };
  }, [questions, activeIndex, quizId, quiz?.settings.paced]);

  async function refreshAggregation(questionId: number) {
    try {
      const data = await getAggregation(questionId);
      setAggregation(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdvance() {
    try {
      const result = await advanceQuizPacing(quizId);
      setPacingIndex(result.current_index);
      setActiveIndex(result.current_index);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to advance');
    }
  }

  async function handleRetreat() {
    try {
      const result = await retreatQuizPacing(quizId);
      setPacingIndex(result.current_index);
      setActiveIndex(result.current_index);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retreat');
    }
  }

  if (error) {
    return (
      <div className="card">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!quiz || questions.length === 0) return <p>No questions yet.</p>;

  const activeQuestion = questions[activeIndex];
  const isPaced = quiz.settings.paced;

  return (
    <div style={{ position: 'relative' }}>
      {gameSpin && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            background: '#16407c',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            fontWeight: 'bold',
            zIndex: 50,
          }}
        >
          Wheel result: {gameSpin.segment}
        </div>
      )}
      <h2>Live Display: {quiz.title}</h2>
      {isPaced && (
        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => void handleRetreat()} disabled={pacingIndex === 0}>
            ← Previous
          </button>
          <strong>
            Question {pacingIndex + 1} / {questions.length}
          </strong>
          <button
            onClick={() => void handleAdvance()}
            disabled={pacingIndex >= questions.length - 1}
          >
            Next →
          </button>
          <span style={{ marginLeft: 'auto', color: 'var(--color-muted)' }}>
            Paced mode — students follow your pace
          </span>
        </div>
      )}
      {!isPaced && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setActiveIndex(index)}
              style={{ fontWeight: activeIndex === index ? 'bold' : 'normal' }}
            >
              Q{index + 1}
            </button>
          ))}
        </div>
      )}

      <div className="card">
        <MarkdownText tag="h3" text={activeQuestion.prompt} />
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
          Type: {activeQuestion.type} | Mode: {activeQuestion.answer_mode} | Points:{' '}
          {activeQuestion.points}
        </p>
        {aggregation?.type === 'word_cloud' && <WordCloud data={aggregation} />}
        {aggregation?.type === 'brainstorming' && (
          <Brainstorm
            data={aggregation}
            questionId={activeQuestion.id}
            onUpvote={() => void refreshAggregation(activeQuestion.id)}
          />
        )}
        {aggregation?.type === 'none' && (
          <p>No live aggregation for this question type.</p>
        )}
      </div>

      {scoreboard && (
        <div className="card">
          <h3>Scoreboard</h3>
          {scoreboard.groups.length > 0 && (
            <GroupScoreboard entries={scoreboard.groups} />
          )}
          {scoreboard.groups.length === 0 && scoreboard.individuals.length > 0 && (
            <IndividualScoreboard entries={scoreboard.individuals} />
          )}
          {scoreboard.groups.length === 0 && scoreboard.individuals.length === 0 && (
            <p>No scores yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function IndividualScoreboard({
  entries,
}: {
  entries: { name: string; total_score: number }[];
}) {
  return (
    <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
      {entries.map((entry, index) => (
        <li key={entry.name} style={{ padding: '0.25rem 0' }}>
          <strong style={index === 0 ? { color: '#2563eb' } : undefined}>
            {index + 1}. {entry.name}
          </strong>{' '}
          — {entry.total_score} pts
        </li>
      ))}
    </ol>
  );
}

function GroupScoreboard({
  entries,
}: {
  entries: { name: string; total_score: number }[];
}) {
  return (
    <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
      {entries.map((entry, index) => (
        <li key={entry.name} style={{ padding: '0.25rem 0' }}>
          <strong style={index === 0 ? { color: '#2563eb' } : undefined}>
            {index + 1}. {entry.name}
          </strong>{' '}
          — {entry.total_score} pts
        </li>
      ))}
    </ol>
  );
}

function WordCloud({ data }: { data: Extract<AggregationData, { type: 'word_cloud' }> }) {
  return <LiveWordCloud words={data.words} />;
}

function Brainstorm({
  data,
  questionId,
  onUpvote,
}: {
  data: Extract<AggregationData, { type: 'brainstorming' }>;
  questionId: number;
  onUpvote: () => void;
}) {
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

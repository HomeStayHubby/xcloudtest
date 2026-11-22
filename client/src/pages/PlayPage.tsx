import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  QuizSettings,
  QuizWithCampaign,
  PublicQuestion,
  ResponseAnswer,
  QuizScoreboard,
  MyQuizResults,
} from '@elitequest/shared';
import { getSocket } from '../api/socket.js';
import { submitAnswer, getAggregation } from '../api/responses.js';
import OptionCards from '../components/OptionCards.js';
import SortableBucketDnD, { type Bucket } from '../components/SortableBucketDnD.js';
import MatchGraph from '../components/MatchGraph.js';
import BrainstormBoard, { authorColor } from '../components/BrainstormBoard.js';
import QuizSummary from '../components/QuizSummary.js';
import { MarkdownText } from '../components/MarkdownText.js';
import type { AggregationData } from '../api/responses.js';

type PacingState = {
  quiz_id: number;
  current_index: number;
  question_id: number | null;
  total_questions: number;
  title: string;
};

type ConfettiPiece = {
  id: number;
  symbol: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
};

const CONFETTI_SYMBOLS = ['🎉', '⭐', '✨', '💯', '🥳'];

function generateConfetti(count = 40): ConfettiPiece[] {
  const result: ConfettiPiece[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      id: i,
      symbol: CONFETTI_SYMBOLS[i % CONFETTI_SYMBOLS.length],
      left: Math.random() * 100,
      duration: 1.4 + Math.random() * 1.2,
      delay: Math.random() * 0.5,
      size: 18 + Math.random() * 14,
    });
  }
  return result;
}

type PlayData = {
  quiz: {
    id: number;
    title: string;
    settings: QuizSettings;
  };
  questions: PublicQuestion[];
};

export default function PlayPage(): JSX.Element {
  const [quizzes, setQuizzes] = useState<QuizWithCampaign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [play, setPlay] = useState<PlayData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState<ResponseAnswer>([]);
  const [feedback, setFeedbackState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null);
  const [quizStartedAt, setQuizStartedAt] = useState<number | null>(null);
  const [scoreboard, setScoreboard] = useState<QuizScoreboard | null>(null);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [gameSpin, setGameSpin] = useState<{ name: string; segment: string } | null>(null);
  const [summary, setSummary] = useState<MyQuizResults | null>(null);
  const confettiTimeout = useRef<number | null>(null);
  const gameSpinTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (play) return;
    void loadOpenQuizzes();
    const interval = window.setInterval(() => {
      void loadOpenQuizzes();
    }, 5000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  useEffect(() => {
    if (!play || quizStartedAt === null) return;
    const totalLimit = play.quiz.settings.time_limit_seconds;
    if (!totalLimit) return;
    const update = () => {
      const elapsed = Math.floor((Date.now() - quizStartedAt) / 1000);
      const remaining = Math.max(0, totalLimit - elapsed);
      setTimeLeft(remaining);
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [play, quizStartedAt]);

  useEffect(() => {
    if (!play) return;
    const socket = getSocket();
    socket.emit('join-quiz', play.quiz.id);
    socket.emit('get-scoreboard', play.quiz.id);
    socket.on('pacing-update', (payload: { quiz_id: number; current_index: number }) => {
      if (play.quiz.settings.paced && payload.quiz_id === play.quiz.id) {
        setCurrentIndex(payload.current_index);
        setAnswer([]);
        setFeedbackState(null);
      }
    });
    socket.on('scoreboard-update', (sb: QuizScoreboard) => {
      if (sb.quiz_id === play.quiz.id) {
        setScoreboard(sb);
      }
    });

    socket.on('game-spin', (payload: { segment: string }) => {
      setGameSpin({ name: 'Wheel', segment: payload.segment });
      if (gameSpinTimeout.current) {
        window.clearTimeout(gameSpinTimeout.current);
      }
      gameSpinTimeout.current = window.setTimeout(() => setGameSpin(null), 5000);
    });

    socket.on('quiz-closed', (payload: { quiz_id: number }) => {
      if (payload.quiz_id === play.quiz.id) {
        void loadSummary(play.quiz.id);
      }
    });

    return () => {
      socket.off('pacing-update');
      socket.off('scoreboard-update');
      socket.off('game-spin');
      socket.off('quiz-closed');
      socket.emit('leave-quiz', play.quiz.id);
    };
  }, [play]);

  useEffect(() => {
    if (!play) return;
    const question = play.questions[currentIndex];
    const limit = question.time_limit_seconds;
    if (!limit) {
      setQuestionTimeLeft(null);
      return;
    }
    setQuestionTimeLeft(limit);
    const interval = window.setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [play, currentIndex]);

  async function loadOpenQuizzes() {
    try {
      const response = await fetch('/api/v1/play/open-quizzes', {
        credentials: 'include',
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message ?? 'Failed to load quizzes');
      }
      const json = (await response.json()) as { data: QuizWithCampaign[] };
      setQuizzes(json.data);
      setLoaded(true);
      if (json.data.length === 0) {
        setError('No open quizzes for this class right now — waiting for the instructor to start one.');
      } else {
        setError(null);
      }
    } catch (err) {
      setLoaded(true);
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    }
  }

  async function loadSummary(quizId: number) {
    try {
      const response = await fetch(`/api/v1/play/quiz/${quizId}/my-results`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message ?? 'Could not load your results');
      }
      const json = (await response.json()) as { data: MyQuizResults };
      setSummary(json.data);
      setFeedbackState(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your results');
    }
  }

  function backToQuizzes() {
    setPlay(null);
    setSummary(null);
    setCurrentIndex(0);
    setAnswer([]);
    setFeedbackState(null);
    setScoreboard(null);
    setQuizStartedAt(null);
    setTimeLeft(null);
    setQuestionTimeLeft(null);
    setError(null);
  }

  async function selectQuiz(quizId: number) {
    setError(null);
    try {
      const response = await fetch(`/api/v1/play/quiz/${quizId}/questions`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message ?? 'Could not start quiz');
      }
      const json = (await response.json()) as { data: PlayData };
      setPlay(json.data);
      setQuizStartedAt(Date.now());
      setAnswer([]);
      setFeedbackState(null);

      if (json.data.quiz.settings.paced) {
        const pacingRes = await fetch(`/api/v1/play/quiz/${quizId}/pacing`, {
          credentials: 'include',
        });
        if (pacingRes.ok) {
          const pacingJson = (await pacingRes.json()) as { data: PacingState };
          setCurrentIndex(pacingJson.data.current_index);
        } else {
          setCurrentIndex(0);
        }
      } else {
        setCurrentIndex(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
    }
  }

  if (!play) {
    return (
      <div className="card">
        <h2>Open Quizzes</h2>
        {error && <p>{error}</p>}
        {quizzes.length === 0 ? (
          loaded ? null : <p>Loading...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {quizzes.map((q) => (
              <li key={q.id} className="card card-interactive">
                <div className="row-between">
                  <strong>{q.title}</strong>
                  {q.campaign_title && <span className="badge badge-campaign">{q.campaign_title}</span>}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <button onClick={() => void selectQuiz(q.id)}>Start</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (summary) {
    return <QuizSummary summary={summary} onBack={backToQuizzes} />;
  }

  return (
    <PlaySession
      play={play}
      currentIndex={currentIndex}
      timeLeft={timeLeft}
      questionTimeLeft={questionTimeLeft}
      scoreboard={scoreboard}
      confetti={confetti}
      gameSpin={gameSpin}
      answer={answer}
      setAnswer={setAnswer}
      feedback={feedback}
      error={error}
      setError={setError}
      setFeedbackState={setFeedbackState}
      setScoreboard={setScoreboard}
      setCurrentIndex={setCurrentIndex}
      setConfetti={setConfetti}
      onFinished={() => void loadSummary(play.quiz.id)}
    />
  );
}

function PlaySession({
  play,
  currentIndex,
  timeLeft,
  questionTimeLeft,
  scoreboard,
  confetti,
  gameSpin,
  answer,
  setAnswer,
  feedback,
  error,
  setError,
  setFeedbackState,
  setCurrentIndex,
  setConfetti,
  onFinished,
}: {
  play: PlayData;
  currentIndex: number;
  timeLeft: number | null;
  questionTimeLeft: number | null;
  scoreboard: QuizScoreboard | null;
  confetti: ConfettiPiece[];
  gameSpin: { name: string; segment: string } | null;
  answer: ResponseAnswer;
  setAnswer: (value: ResponseAnswer) => void;
  feedback: string | null;
  error: string | null;
  setError: (value: string | null) => void;
  setFeedbackState: (value: string | null | ((prev: string | null) => string | null)) => void;
  setScoreboard: (value: QuizScoreboard | null) => void;
  setCurrentIndex: (value: number | ((prev: number) => number)) => void;
  setConfetti: (value: ConfettiPiece[]) => void;
  onFinished: () => void;
}) {
  const question = play.questions[currentIndex];
  const quizExpired = timeLeft === 0;
  const questionExpired = questionTimeLeft === 0;

  const triggerConfetti = useCallback((): void => {
    setConfetti(generateConfetti());
    window.setTimeout(() => setConfetti([]), 1600);
  }, [setConfetti]);

  async function handleSubmit() {
    if (quizExpired || questionExpired) return;
    setError(null);
    setFeedbackState(null);
    try {
      const result = (await submitAnswer(question.id, answer)) as {
        data: { score: number | null };
      };
      if (play.quiz.settings.show_answers && result.data.score !== null) {
        const score = result.data.score;
        setFeedbackState(score > 0 ? `Correct! +${score} points 🎉` : 'Recorded');
        if (score > 0) {
          triggerConfetti();
        }
      } else {
        setFeedbackState('Answer submitted!');
      }
      if (play.quiz.settings.paced) {
        // Instructor advances.
      } else if (currentIndex < play.questions.length - 1) {
        window.setTimeout(() => {
          setCurrentIndex((i) => i + 1);
          setAnswer([]);
          setFeedbackState(null);
        }, 1200);
      } else {
        // Last question answered: show the post-quiz summary.
        onFinished();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    }
  }

  if (play.questions.length === 0) {
    return <p>No questions available yet.</p>;
  }

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <ConfettiOverlay confetti={confetti} />
      {gameSpin && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, #1e1b4b, #4338ca)',
            color: 'white',
            padding: '1.5rem 2rem',
            borderRadius: '1rem',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            zIndex: 50,
            boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
            textAlign: 'center',
          }}
        >
          {gameSpin.name} → {gameSpin.segment}
        </div>
      )}

      <h2>{play.quiz.title}</h2>
      <p>
        Question {currentIndex + 1} of {play.questions.length} ({question.answer_mode}) |
        Points: {question.points}
      </p>
      {timeLeft !== null && (
        <p className={quizExpired ? 'error' : ''}>Quiz time left: {formatSeconds(timeLeft)}</p>
      )}
      {questionTimeLeft !== null && (
        <p className={questionExpired ? 'error' : ''}>
          Question time left: {formatSeconds(questionTimeLeft)}
        </p>
      )}
      <MarkdownText tag="h3" text={question.prompt} />
      <AnswerInput
        question={question}
        answer={answer}
        setAnswer={setAnswer}
        disabled={quizExpired || questionExpired}
      />
      {error && <p className="error">{error}</p>}
      {feedback && <p className="success">{feedback}</p>}
      {play.quiz.settings.paced && feedback && (
        <p>Waiting for the instructor to advance…</p>
      )}
      <button onClick={() => void handleSubmit()} disabled={quizExpired || questionExpired}>
        Submit Answer
      </button>
      {quizExpired && <p className="error">Time is up!</p>}

      {scoreboard && (scoreboard.individuals.length > 0 || scoreboard.groups.length > 0) && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <ScoreboardPanel scoreboard={scoreboard} />
        </div>
      )}
    </div>
  );
}

function ConfettiOverlay({ confetti }: { confetti: ConfettiPiece[] }): JSX.Element {
  return (
    <>
      <style>{`
        .confetti-piece {
          position: absolute;
          top: -10%;
          animation-iteration-count: 1;
          animation-name: confetti-fall;
          animation-timing-function: ease-in-out;
          pointer-events: none;
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {confetti.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            fontSize: `${piece.size}px`,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
          }}
        >
          {piece.symbol}
        </span>
      ))}
    </>
  );
}

function ScoreboardPanel({ scoreboard }: { scoreboard: QuizScoreboard }): JSX.Element {
  const entries = scoreboard.groups.length > 0 ? scoreboard.groups : scoreboard.individuals;
  return (
    <>
      <h4>Scoreboard</h4>
      {entries.map((entry, index) => (
        <div
          key={entry.name}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.5rem 0',
            borderTop: index > 0 ? '1px solid var(--color-border)' : 'none',
            fontWeight: index === 0 ? 700 : 500,
            color: index === 0 ? 'var(--color-primary)' : 'inherit',
          }}
        >
          <span>
            {index + 1}. {entry.name}
          </span>
          <span>{entry.total_score} pts</span>
        </div>
      ))}
    </>
  );
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function AnswerInput({
  question,
  answer,
  setAnswer,
  disabled,
}: {
  question: PublicQuestion;
  answer: ResponseAnswer;
  setAnswer: (value: ResponseAnswer) => void;
  disabled?: boolean;
}) {
  const data = question.data;

  if (data.type === 'mcq_single') {
    return (
      <OptionCards
        options={data.options}
        selected={typeof answer === 'string' ? [answer] : []}
        onChange={(ids) => setAnswer(ids[0] ?? '')}
        disabled={disabled}
      />
    );
  }

  if (data.type === 'mcq_multi') {
    const selected = Array.isArray(answer) ? (answer as string[]) : [];
    return (
      <OptionCards
        options={data.options}
        selected={selected}
        onChange={(ids) => setAnswer(ids)}
        multi
        disabled={disabled}
      />
    );
  }

  if (data.type === 'short_answer') {
    return (
      <input
        value={(answer as string) ?? ''}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={disabled}
        placeholder="Type your answer"
      />
    );
  }

  if (data.type === 'fill_blanks') {
    const blanks = data.segments.filter((s) => s.blank);
    const values = Array.isArray(answer) ? (answer as string[]) : blanks.map(() => '');
    return (
      <div
        style={{
          fontSize: '1.15rem',
          lineHeight: 2.2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.35rem',
        }}
      >
        {data.segments.map((seg, i) =>
          seg.blank ? (
            <input
              key={i}
              value={values[data.segments.slice(0, i).filter((s) => s.blank).length] ?? ''}
              onChange={(e) => {
                const blankIndex = data.segments.slice(0, i).filter((s) => s.blank).length;
                const next = [...values];
                next[blankIndex] = e.target.value;
                setAnswer(next);
              }}
              disabled={disabled}
              placeholder="?"
              style={{
                width: '140px',
                display: 'inline-block',
                marginBottom: 0,
                textAlign: 'center',
              }}
            />
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>
    );
  }

  if (data.type === 'matching') {
    const pairs = typeof answer === 'object' && !Array.isArray(answer) ? (answer as Record<string, string>) : {};
    return (
      <MatchGraph
        leftItems={data.left_items}
        rightItems={data.right_items}
        pairs={pairs}
        onChange={(next) => setAnswer(next)}
        readonly={disabled}
      />
    );
  }

  if (data.type === 'grouping') {
    const submitted = typeof answer === 'object' && !Array.isArray(answer) ? (answer as Record<string, string>) : {};
    const allBuckets: Bucket[] = [
      ...data.groups.map((g) => ({ id: g.id, name: g.name, items: [] as BucketItem[] })),
      { id: '__unassigned__', name: 'Unassigned items', items: [] },
    ];
    const lookup = new Map(allBuckets.map((b) => [b.id, b]));
    data.items.forEach((item) => {
      const groupId = submitted[item.id];
      const bucket = groupId ? (lookup.get(groupId) ?? lookup.get('__unassigned__')!) : lookup.get('__unassigned__')!;
      bucket.items.push({ id: item.id, text: item.text });
    });

    return (
      <SortableBucketDnD
        buckets={allBuckets}
        onChange={(nextBuckets) => {
          const next: Record<string, string> = {};
          nextBuckets.forEach((b) => {
            if (b.id === '__unassigned__') return;
            b.items.forEach((item) => (next[item.id] = b.id));
          });
          setAnswer(next);
        }}
        unassignedId="__unassigned__"
        unassignedLabel="Drag items here"
      />
    );
  }

  if (data.type === 'brainstorming') {
    return (
      <BrainstormStudentInput
        question={question}
        answer={answer}
        setAnswer={setAnswer}
        disabled={disabled}
      />
    );
  }

  if (data.type === 'word_cloud') {
    const values = Array.isArray(answer) ? (answer as string[]) : [''];
    return (
      <div>
        {values.map((value, index) => (
          <input
            key={index}
            value={value}
            placeholder="Word"
            onChange={(e) => {
              const next = [...values];
              next[index] = e.target.value;
              setAnswer(next);
            }}
            disabled={disabled}
          />
        ))}
        {values.length < data.max_words_per_student && (
          <button type="button" onClick={() => setAnswer([...values, ''])} disabled={disabled}>
            Add Word
          </button>
        )}
      </div>
    );
  }

  return <p>Unsupported question type.</p>;
}

type BucketItem = { id: string; text: string };

function BrainstormStudentInput({
  question,
  answer,
  setAnswer,
  disabled,
}: {
  question: PublicQuestion;
  answer: ResponseAnswer;
  setAnswer: (value: ResponseAnswer) => void;
  disabled?: boolean;
}) {
  const data = question.data;
  const max = data.type === 'brainstorming' ? (data.max_ideas_per_student ?? 10) : 10;
  const values = Array.isArray(answer) ? (answer as string[]) : [''];
  const [cloud, setCloud] = useState<Extract<AggregationData, { type: 'brainstorming' }> | null>(null);
  const [upvotedIdeas, setUpvotedIdeas] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (data.type !== 'brainstorming') return;
    const load = () => {
      getAggregation(question.id)
        .then((agg) => {
          if (agg.type === 'brainstorming') setCloud(agg);
        })
        .catch(() => undefined);
    };
    load();
    const interval = window.setInterval(load, 5000);
    return () => window.clearInterval(interval);
  }, [question.id, data.type]);

  async function handleUpvote(idea: string) {
    try {
      const res = await import('../api/responses.js').then((m) => m.upvoteIdea(question.id, idea));
      if (res.type === 'brainstorming') {
        setCloud(res);
        setUpvotedIdeas((prev) => new Set(prev).add(idea));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        {values.map((value, index) => (
          <input
            key={index}
            value={value}
            placeholder="Idea"
            onChange={(e) => {
              const next = [...values];
              next[index] = e.target.value;
              setAnswer(next);
            }}
            disabled={disabled}
          />
        ))}
        {values.length < max && (
          <button type="button" onClick={() => setAnswer([...values, ''])} disabled={disabled}>
            Add Idea
          </button>
        )}
      </div>
      {cloud && cloud.ideas.length > 0 && (
        <div className="card" style={{ background: '#f8fafc' }}>
          <BrainstormBoard
            notes={cloud.ideas.map((idea) => ({
              idea: idea.idea,
              count: idea.count,
              upvotes: idea.upvotes,
              submitters: idea.submitters ?? [],
              color: authorColor(idea.submitters?.[0] ?? idea.idea),
              authorName: null,
            }))}
            onUpvote={(idea) => {
              if (upvotedIdeas.has(idea)) return;
              void handleUpvote(idea);
            }}
          />
        </div>
      )}
    </div>
  );
}


import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGame, spinGame, type Game } from '../api/games.js';
import { getSocket } from '../api/socket.js';
import { MarkdownText } from '../components/MarkdownText.js';
import type { GameSettings, WheelSegment, JeopardyCategory, JeopardyCell } from '@elitequest/shared';

export default function GamePlayPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const gameId = Number(id);
  const [game, setGame] = useState<Game | null>(null);
  const [lastSpin, setLastSpin] = useState<{ segment: string; segmentIndex: number } | null>(null);
  const [revealedCell, setRevealedCell] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadGame();
  }, [gameId]);

  useEffect(() => {
    if (!game) return;
    const socket = getSocket();
    socket.emit('join-class', game.class_id);
    socket.on('game-spin', (payload: { gameId: number; segment: string; segmentIndex: number }) => {
      if (payload.gameId === game.id) {
        setLastSpin({ segment: payload.segment, segmentIndex: payload.segmentIndex });
      }
    });
    return () => {
      socket.emit('leave-class', game.class_id);
      socket.off('game-spin');
    };
  }, [game]);

  async function loadGame() {
    try {
      setGame(await getGame(gameId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
    }
  }

  if (error) return <div className="card"><p className="error">{error}</p></div>;
  if (!game) return <p>Loading game...</p>;

  const settings = game.settings as GameSettings;

  return (
    <div>
      <p>
        <Link to={`/classes/${game.class_id}/games`}>&larr; Back to games</Link>
      </p>
      <h2>{game.name}</h2>
      {settings.kind === 'wheel_of_fortune' && (
        <WheelGame game={game} lastSpin={lastSpin} onSpin={async () => {
          try {
            const result = await spinGame(game.id);
            setLastSpin({ segment: result.segment.label, segmentIndex: result.index });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Spin failed');
          }
        }} />
      )}
      {settings.kind === 'jeopardy' && (
        <JeopardyGame
          categories={settings.categories}
          cells={settings.cells}
          revealedCell={revealedCell}
          setRevealedCell={setRevealedCell}
        />
      )}
    </div>
  );
}

function WheelGame({
  game,
  lastSpin,
  onSpin,
}: {
  game: Game;
  lastSpin: { segment: string; segmentIndex: number } | null;
  onSpin: () => Promise<void>;
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const segments = ((game.settings as GameSettings & { kind: 'wheel_of_fortune' })
    .segments ?? []) as WheelSegment[];

  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0) || 1;

  async function handleSpin() {
    if (spinning) return;
    setSpinning(true);
    await onSpin();
    setSpinning(false);
  }

  useEffect(() => {
    if (!lastSpin) return;
    let startAngle = 0;
    let targetAngle = 0;
    for (let i = 0; i < segments.length; i++) {
      const angle = (segments[i]!.weight / totalWeight) * 360;
      if (i === lastSpin.segmentIndex) {
        targetAngle = 360 - startAngle - angle / 2;
        break;
      }
      startAngle += angle;
    }
    setRotation((prev) => prev + 360 * 5 + targetAngle - (prev % 360));
  }, [lastSpin]);

  const gradientParts: string[] = [];
  let currentDeg = 0;
  const colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];
  segments.forEach((s, i) => {
    const deg = (s.weight / totalWeight) * 360;
    gradientParts.push(`${colors[i % colors.length]} ${currentDeg}deg ${currentDeg + deg}deg`);
    currentDeg += deg;
  });

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div
        style={{
          margin: '1rem auto',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: `conic-gradient(${gradientParts.join(', ')})`,
          border: '8px solid #1f2937',
          position: 'relative',
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {segments.map((s, i) => {
          const angle =
            (segments.slice(0, i).reduce((sum, seg) => sum + seg.weight, 0) / totalWeight) * 360 +
            (s.weight / totalWeight) * 180;
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                transform: `rotate(${angle}deg) translateY(-105px)`,
                transformOrigin: '50% 140px',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.8rem',
              }}
            >
              {s.label}
            </span>
          );
        })}
        <div
          style={{
            position: 'absolute',
            top: '-18px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '2rem',
          }}
        >
          ▼
        </div>
      </div>
      <button onClick={() => void handleSpin()} disabled={spinning}>
        {spinning ? 'Spinning…' : 'Spin!'}
      </button>
      {lastSpin && (
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Result: {lastSpin.segment}</p>
      )}
    </div>
  );
}

function JeopardyGame({
  categories,
  cells,
  revealedCell,
  setRevealedCell,
}: {
  categories: JeopardyCategory[];
  cells: JeopardyCell[];
  revealedCell: string | null;
  setRevealedCell: (id: string | null) => void;
}) {
  const byCategory = new Map<string, JeopardyCell[]>();
  for (const category of categories) {
    byCategory.set(category.id, []);
  }
  for (const cell of cells) {
    const list = byCategory.get(cell.category_id) ?? [];
    list.push(cell);
    byCategory.set(cell.category_id, list);
  }

  const revealed = cells.find((c) => c.id === revealedCell) ?? null;

  return (
    <div>
      <style>{`
        .jeopardy-board { display: flex; gap: 0.5rem; }
        .jeopardy-col { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .jeopardy-header { background: #16407c; color: white; padding: 1rem; text-align: center; font-weight: bold; }
        .jeopardy-cell { background: #0055d4; color: #ffd700; text-align: center; padding: 2rem 0; font-weight: bold; font-size: 1.5rem; cursor: pointer; border: none; }
        .jeopardy-cell.revealed { background: #b0c4de; color: #666; cursor: default; }
        .jeopardy-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .jeopardy-prompt { background: #0055d4; color: white; padding: 2rem; font-size: 1.5rem; max-width: 600px; border-radius: 0.5rem; text-align: center; }
      `}</style>
      <div className="jeopardy-board">
        {categories.map((category) => (
          <div key={category.id} className="jeopardy-col">
            <div className="jeopardy-header">{category.name}</div>
            {(byCategory.get(category.id) ?? [])
              .sort((a, b) => a.points - b.points)
              .map((cell) => (
                <button
                  key={cell.id}
                  className={`jeopardy-cell ${cell.id === revealedCell ? 'revealed' : ''}`}
                  onClick={() => setRevealedCell(cell.id)}
                >
                  ${cell.points}
                </button>
              ))}
          </div>
        ))}
      </div>
      {revealed && (
        <div className="jeopardy-overlay" onClick={() => setRevealedCell(null)}>
          <div className="jeopardy-prompt">
            <p style={{ color: '#ffd700', fontWeight: 'bold' }}>${revealed.points}</p>
            <MarkdownText text={revealed.prompt} />
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
}

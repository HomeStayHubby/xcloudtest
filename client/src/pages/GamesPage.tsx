import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listGames, createGame, deleteGame, type Game } from '../api/games.js';

export default function GamesPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'wheel_of_fortune' | 'jeopardy'>('wheel_of_fortune');

  useEffect(() => {
    void load();
  }, [classId]);

  async function load() {
    try {
      setGames(await listGames(classId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const settings =
        type === 'wheel_of_fortune'
          ? {
              kind: 'wheel_of_fortune' as const,
              segments: [
                { label: '+1 point', weight: 3 },
                { label: '+2 points', weight: 2 },
                { label: 'Bonus!', weight: 1 },
              ],
            }
          : {
              kind: 'jeopardy' as const,
              categories: [{ id: 'c1', name: 'Category 1' }],
              cells: [{ id: 'cell1', category_id: 'c1', points: 100, prompt: 'Tap to customize this prompt' }],
            };
      await createGame(classId, { name, type, settings });
      setName('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this game?')) return;
    try {
      await deleteGame(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  return (
    <div>
      <p>
        <Link to={`/classes/${classId}`}>&larr; Back to class</Link>
      </p>
      <h2>Mini-Games</h2>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Create Game</h3>
        <form onSubmit={(e) => void handleCreate(e)}>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            <option value="wheel_of_fortune">Wheel of Fortune</option>
            <option value="jeopardy">Jeopardy Board</option>
          </select>
          <button type="submit">Create</button>
        </form>
      </div>

      {games.length === 0 ? (
        <p>No games yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {games.map((game) => (
            <div key={game.id} className="card card-interactive">
              <h3 style={{ marginTop: 0 }}>{game.name}</h3>
              <span className="badge badge-closed">{game.type.replace('_', ' ')}</span>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Link to={`/games/${game.id}`} className="button">
                  Open
                </Link>
                <button onClick={() => void handleDelete(game.id)} className="secondary">
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

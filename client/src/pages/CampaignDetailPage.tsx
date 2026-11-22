import { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getCampaign,
  addQuizToCampaign,
  removeQuizFromCampaign,
  reorderPlaylist,
  type CampaignDetail,
} from '../api/campaigns.js';
import { listQuizzes, openQuiz, closeQuiz, type Quiz as QuizType } from '../api/quizzes.js';

export default function CampaignDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [campaignId]);

  async function load() {
    setError(null);
    try {
      const [detail, quizList] = await Promise.all([getCampaign(campaignId), listQuizzes()]);
      setCampaign(detail);
      setQuizzes(quizList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign');
    }
  }

  async function run<T>(action: () => Promise<T>, failure: string): Promise<T | undefined> {
    setError(null);
    try {
      return await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : failure);
      return undefined;
    }
  }

  async function handleAddQuiz(event: FormEvent) {
    event.preventDefault();
    if (!selectedQuizId) return;
    const result = await run(
      () => addQuizToCampaign(campaignId, Number(selectedQuizId)),
      'Failed to add quiz'
    );
    if (result) {
      setSelectedQuizId('');
      await load();
    }
  }

  async function handleRemoveQuiz(quizId: number) {
    if (!confirm('Remove this quiz from the campaign playlist?')) return;
    await run(() => removeQuizFromCampaign(campaignId, quizId), 'Failed to remove quiz');
    await load();
  }

  async function handleMove(quizId: number, direction: -1 | 1) {
    if (!campaign) return;
    const ids = campaign.items.map((item) => item.quiz_id);
    const index = ids.indexOf(quizId);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await run(() => reorderPlaylist(campaignId, ids), 'Failed to reorder playlist');
    await load();
  }

  async function handleToggleStatus(quiz: QuizType) {
    if (quiz.status === 'open') {
      await run(() => closeQuiz(quiz.id), 'Failed to close quiz');
    } else {
      await run(() => openQuiz(quiz.id), 'Failed to open quiz');
    }
    await load();
  }

  if (!campaign) {
    return <p>{error ?? 'Loading...'}</p>;
  }

  const playlistIds = new Set(campaign.items.map((item) => item.quiz_id));
  const availableQuizzes = quizzes.filter((quiz) => !playlistIds.has(quiz.id));

  return (
    <div>
      <p>
        <Link to={`/classes/${campaign.class_id}`} className="button secondary">
          &larr; Back to class
        </Link>
      </p>
      <div className="page-heading">
        <h2>{campaign.title}</h2>
        <Link to={`/campaigns/${campaignId}/results`} className="button success">
          View cumulative results
        </Link>
      </div>
      {campaign.description && <p style={{ color: 'var(--color-muted)' }}>{campaign.description}</p>}
      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Playlist</h3>
        <p style={{ color: 'var(--color-muted)' }}>
          Students of this class can play open playlist quizzes; every result rolls up into the
          campaign's cumulative results.
        </p>
        {campaign.items.length === 0 ? (
          <p>No quizzes in this campaign yet — add one below.</p>
        ) : (
          <ul className="playlist">
            {campaign.items.map((item, index) => (
              <li key={item.quiz_id} className="playlist-item">
                <div className="playlist-order">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => handleMove(item.quiz_id, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                  >
                    &uarr;
                  </button>
                  <span className="playlist-position">{index + 1}</span>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => handleMove(item.quiz_id, 1)}
                    disabled={index === campaign.items.length - 1}
                    aria-label="Move down"
                  >
                    &darr;
                  </button>
                </div>
                <div className="playlist-main">
                  <strong>
                    <Link to={`/quizzes/${item.quiz_id}/edit`}>{item.quiz.title}</Link>
                  </strong>
                  <span className={`badge badge-${item.quiz.status}`}>{item.quiz.status}</span>
                </div>
                <div className="playlist-actions">
                  <button onClick={() => handleToggleStatus(item.quiz)}>
                    {item.quiz.status === 'open' ? 'Close' : 'Open'}
                  </button>
                  <Link to={`/quizzes/${item.quiz_id}/run`} className="button secondary">
                    Present
                  </Link>
                  <Link to={`/quizzes/${item.quiz_id}/results`} className="button secondary">
                    Results
                  </Link>
                  <button onClick={() => handleRemoveQuiz(item.quiz_id)} className="secondary">
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>Add quiz to playlist</h3>
        <form onSubmit={handleAddQuiz} className="inline-form">
          <select value={selectedQuizId} onChange={(e) => setSelectedQuizId(e.target.value)}>
            <option value="" disabled>
              Select a quiz
            </option>
            {availableQuizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
          <button type="submit" disabled={!selectedQuizId}>
            Add to playlist
          </button>
        </form>
        {availableQuizzes.length === 0 && (
          <p>
            No more quizzes available — <Link to="/quizzes">create one</Link> first.
          </p>
        )}
      </div>
    </div>
  );
}

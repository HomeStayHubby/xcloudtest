import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCampaign, getCampaignResults, type CampaignDetail, type CampaignResults } from '../api/campaigns.js';

export default function CampaignResultsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [data, setData] = useState<CampaignResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [campaignId]);

  async function load() {
    setError(null);
    try {
      const [detail, results] = await Promise.all([
        getCampaign(campaignId),
        getCampaignResults(campaignId),
      ]);
      setCampaign(detail);
      setData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign results');
    }
  }

  if (error) {
    return (
      <div className="card">
        <p className="error">{error}</p>
      </div>
    );
  }
  if (!campaign || !data) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <p>
        <Link to={`/campaigns/${campaignId}`} className="button secondary">
          &larr; Back to campaign
        </Link>
      </p>
      <h2>{campaign.title} — Cumulative Results</h2>

      <div className="results-grid">
        <ResultsCard
          title="Individuals"
          entries={data.individuals.map((entry) => ({
            id: String(entry.student_id),
            name: entry.display_name,
            score: entry.total_score,
            responses: entry.responses,
          }))}
        />
        <ResultsCard
          title="Groups"
          entries={data.groups.map((entry) => ({
            id: String(entry.group_id),
            name: entry.group_name,
            score: entry.total_score,
            responses: entry.responses,
          }))}
        />
      </div>

      <div className="card">
        <h3>Per-quiz breakdown</h3>
        {data.per_quiz.length === 0 ? (
          <p>No quizzes in this campaign yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Quiz</th>
                <th>Responses</th>
                <th>Total points</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {campaign.items.map((item, index) => {
                const stat = data.per_quiz.find((q) => q.quiz_id === item.quiz_id);
                return (
                  <tr key={item.quiz_id}>
                    <td>{index + 1}</td>
                    <td>{item.quiz.title}</td>
                    <td>{stat?.responses ?? 0}</td>
                    <td>{stat?.total_score ?? 0}</td>
                    <td>
                      <Link to={`/quizzes/${item.quiz_id}/results`}>Details</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ResultsCard({
  title,
  entries,
}: {
  title: string;
  entries: { id: string; name: string; score: number; responses: number }[];
}) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {entries.length === 0 ? (
        <p>No scores yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={index === 0 ? 'rank-row rank-first' : 'rank-row'}
            >
              <span className="rank-badge">{index + 1}</span>
              <span style={{ flex: 1, fontWeight: index === 0 ? 700 : 600 }}>{entry.name}</span>
              <span style={{ fontWeight: 700 }}>{entry.score} pts</span>
              <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                {entry.responses} resp
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

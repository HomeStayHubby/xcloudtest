import { useState } from 'react';
import styles from './BrainstormBoard.module.css';

export type BrainstormNote = {
  idea: string;
  count: number;
  upvotes: number;
  submitters: string[];
  // Stable author colour derived from submitter ids in parent.
  color: string;
  authorName?: string | null;
};

export type BrainstormBoardProps = {
  notes: BrainstormNote[];
  onUpvote?: (idea: string) => void;
  showNames?: boolean;
};

export const POST_IT_COLORS = [
  { bg: '#fef3c7', text: '#78350f' },
  { bg: '#dbeafe', text: '#1e3a8a' },
  { bg: '#dcfce7', text: '#14532d' },
  { bg: '#fce7f3', text: '#831843' },
  { bg: '#e0e7ff', text: '#3730a3' },
  { bg: '#ccfbf1', text: '#134e4a' },
  { bg: '#ffedd5', text: '#7c2d12' },
  { bg: '#f3e8ff', text: '#581c87' },
];

export default function BrainstormBoard({
  notes,
  onUpvote,
  showNames = false,
}: BrainstormBoardProps): JSX.Element {
  const [namesVisible, setNamesVisible] = useState(showNames);

  return (
    <div>
      <div className={styles.toggleBar}>
        <label>
          <input
            type="checkbox"
            checked={namesVisible}
            onChange={(e) => setNamesVisible(e.target.checked)}
          />
          Show submitter names
        </label>
      </div>
      <div className={styles.board}>
        {notes.length === 0 ? (
          <span className={styles.empty}>No ideas yet…</span>
        ) : (
          notes.map((note, index) => {
            const rotate = -3 + (index % 7) * 1;
            return (
              <article
                key={`${note.idea}-${index}`}
                className={styles.note}
                style={{
                  background: note.color,
                  color: POST_IT_COLORS.find((c) => c.bg === note.color)?.text ?? '#1f2937',
                  '--rotate': `${rotate}deg`,
                  animationDelay: `${index * 0.06}s`,
                } as React.CSSProperties}
              >
                <span className={styles.tape} />
                <p className={styles.ideaText}>{note.idea}</p>
                <div className={styles.footer}>
                  {namesVisible && note.authorName ? (
                    <span className={styles.author}>{note.authorName}</span>
                  ) : (
                    <span />
                  )}
                  <span className={styles.upvoteBadge}>
                    {note.upvotes > 0 && `★ ${note.upvotes}`}
                    {onUpvote && (
                      <button
                        className={styles.upvoteButton}
                        type="button"
                        onClick={() => onUpvote(note.idea)}
                        title="Upvote"
                      >
                        +1
                      </button>
                    )}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export function authorColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % POST_IT_COLORS.length;
  return POST_IT_COLORS[index].bg;
}

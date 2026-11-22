import { useMemo, useState } from 'react';
import styles from './LiveWordCloud.module.css';

export type WordEntry = {
  word: string;
  count: number;
  submitters?: string[];
};

export type LiveWordCloudProps = {
  words: WordEntry[];
};

const PALETTE = [
  '#4f46e5',
  '#06b6d4',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

export default function LiveWordCloud({ words }: LiveWordCloudProps): JSX.Element {
  const [selected, setSelected] = useState<WordEntry | null>(null);
  const max = useMemo(() => Math.max(1, ...words.map((w) => w.count)), [words]);

  const layout = useMemo(() => {
    return [...words]
      .sort((a, b) => b.count - a.count)
      .map((entry, index) => {
        const ratio = entry.count / max;
        const size = 1.1 + ratio * 4;
        const color = PALETTE[index % PALETTE.length];
        const offsetY = -12 + (index % 5) * 6 + (Math.floor(index / 5) % 2) * 3;
        const floatDuration = 3.5 + (index % 4) * 0.7;
        const floatDelay = (index % 7) * 0.15;
        return { entry, size, color, offsetY, floatDuration, floatDelay, index };
      });
  }, [words, max]);

  if (words.length === 0) {
    return (
      <div className={styles.cloud}>
        <span className={styles.empty}>No responses yet…</span>
      </div>
    );
  }

  return (
    <>
      <div className={styles.cloud}>
        {layout.map((item) => (
          <span
            key={`${item.entry.word}-${item.index}`}
            className={`${styles.word} animate-pop`}
            style={{
              fontSize: `${item.size}rem`,
              color: item.color,
              transform: `translateY(${item.offsetY}px)`,
              '--float-duration': `${item.floatDuration}s`,
              '--float-delay': `${item.floatDelay}s`,
              animationDelay: `${item.index * 0.04}s`,
            } as React.CSSProperties}
            onClick={() => setSelected(item.entry)}
          >
            {item.entry.word}
          </span>
        ))}
      </div>
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4
              style={{
                color: PALETTE[words.findIndex((w) => w.word === selected.word) % PALETTE.length],
              }}
            >
              {selected.word}
            </h4>
            <p>Contributors ({selected.count}):</p>
            {selected.submitters && selected.submitters.length > 0 ? (
              <ul>
                {selected.submitters.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>Submitter names not available.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

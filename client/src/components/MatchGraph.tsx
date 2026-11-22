import { useEffect, useRef, useState } from 'react';
import styles from './MatchGraph.module.css';

export type MatchNode = {
  id: string;
  text: string;
};

export type MatchGraphProps = {
  leftItems: MatchNode[];
  rightItems: MatchNode[];
  pairs: Record<string, string>;
  onChange: (pairs: Record<string, string>) => void;
  readonly?: boolean;
};

export default function MatchGraph({
  leftItems,
  rightItems,
  pairs,
  onChange,
  readonly = false,
}: MatchGraphProps): JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  function handleLeftClick(id: string) {
    if (readonly) return;
    if (selectedLeft === id) {
      setSelectedLeft(null);
      return;
    }
    if (selectedRight) {
      onChange({ ...pairs, [id]: selectedRight });
      setSelectedRight(null);
      setSelectedLeft(null);
      return;
    }
    setSelectedLeft(id);
  }

  function handleRightClick(id: string) {
    if (readonly) return;
    if (selectedRight === id) {
      setSelectedRight(null);
      return;
    }
    if (selectedLeft) {
      onChange({ ...pairs, [selectedLeft]: id });
      setSelectedRight(null);
      setSelectedLeft(null);
      return;
    }
    setSelectedRight(id);
  }

  function clearPair(leftId: string) {
    if (readonly) return;
    const next = { ...pairs };
    delete next[leftId];
    onChange(next);
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    function onLeave() {
      setMousePos(null);
    }
    const node = wrapperRef.current;
    if (!node) return;
    node.addEventListener('mousemove', onMove);
    node.addEventListener('mouseleave', onLeave);
    return () => {
      node.removeEventListener('mousemove', onMove);
      node.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const lines: { left: string; right: string; path: string }[] = [];
  Object.entries(pairs).forEach(([leftId, rightId]) => {
    const start = getCenter(leftRefs.current[leftId], wrapperRef.current);
    const end = getCenter(rightRefs.current[rightId], wrapperRef.current);
    if (start && end) {
      lines.push({ left: leftId, right: rightId, path: bezierPath(start, end) });
    }
  });

  let previewPath: string | null = null;
  if (!readonly && (selectedLeft || selectedRight)) {
    const anchorId = selectedLeft ?? selectedRight ?? '';
    const refs = selectedLeft ? leftRefs.current : rightRefs.current;
    const anchor = getCenter(refs[anchorId], wrapperRef.current);
    const cursor = mousePos;
    if (anchor && cursor) {
      previewPath = selectedLeft
        ? bezierPath(anchor, cursor)
        : bezierPath(cursor, anchor);
    }
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.column}>
        {leftItems.map((item) => {
          const isMatched = Boolean(pairs[item.id]);
          return (
            <button
              key={item.id}
              ref={(el) => (leftRefs.current[item.id] = el)}
              type="button"
              className={`${styles.island} ${selectedLeft === item.id ? styles.selected : ''} ${isMatched ? styles.matched : ''}`}
              onClick={() => handleLeftClick(item.id)}
              onDoubleClick={() => clearPair(item.id)}
              title={isMatched ? 'Double-click to disconnect' : undefined}
            >
              {item.text}
            </button>
          );
        })}
      </div>
      <div className={styles.column}>
        {rightItems.map((item) => {
          const isMatched = Object.values(pairs).includes(item.id);
          return (
            <button
              key={item.id}
              ref={(el) => (rightRefs.current[item.id] = el)}
              type="button"
              className={`${styles.island} ${selectedRight === item.id ? styles.selected : ''} ${isMatched ? styles.matched : ''}`}
              onClick={() => handleRightClick(item.id)}
            >
              {item.text}
            </button>
          );
        })}
      </div>
      <svg className={styles.svgLayer}>
        {lines.map((line) => (
          <path
            key={`${line.left}-${line.right}`}
            d={line.path}
            className={styles.path}
          />
        ))}
        {previewPath && (
          <path d={previewPath} className={styles.pathPreview} />
        )}
      </svg>
      {!readonly && (
        <p className={styles.help}>
          Click a left item, then a right item to connect. Double-click a connected left item to
          disconnect.
        </p>
      )}
    </div>
  );
}

function getCenter(
  el: HTMLElement | null,
  container: HTMLElement | null
): { x: number; y: number } | null {
  if (!el || !container) return null;
  const elRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return {
    x: elRect.left + elRect.width / 2 - containerRect.left,
    y: elRect.top + elRect.height / 2 - containerRect.top,
  };
}

function bezierPath(start: { x: number; y: number }, end: { x: number; y: number }): string {
  const midX = (start.x + end.x) / 2;
  return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
}

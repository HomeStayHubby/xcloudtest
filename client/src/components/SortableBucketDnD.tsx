import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from '@dnd-kit/core';
import styles from './SortableBucketDnD.module.css';

export type BucketItem = {
  id: string;
  text: string;
};

export type Bucket = {
  id: string;
  name: string;
  items: BucketItem[];
};

export type BucketsState = Bucket[];

type SortableBucketDnDProps = {
  buckets: Bucket[];
  onChange: (buckets: Bucket[]) => void;
  unassignedLabel?: string;
  unassignedId?: string;
};

export default function SortableBucketDnD({
  buckets,
  onChange,
  unassignedLabel = 'Unassigned',
  unassignedId = '__unassigned__',
}: SortableBucketDnDProps): JSX.Element {
  const [dragId, setDragId] = useState<string | null>(null);

  const allItems = useMemo(
    () => buckets.flatMap((b) => b.items.map((item) => ({ ...item, bucketId: b.id }))),
    [buckets]
  );

  function moveItem(itemId: string, targetBucketId: string) {
    const source = allItems.find((i) => i.id === itemId);
    if (!source) return;
    const next = buckets.map((b) => ({ ...b, items: b.items.filter((i) => i.id !== itemId) }));

    const dest = next.find((b) => b.id === targetBucketId);
    if (!dest) return;
    dest.items.push({ id: source.id, text: source.text });
    onChange(next);
  }

  function handleDragStart(event: DragStartEvent) {
    setDragId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragId(null);
    const { active, over } = event;
    if (!over) return;
    moveItem(String(active.id), String(over.id));
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
  };

  const draggingItem = dragId ? allItems.find((i) => i.id === dragId) ?? null : null;
  const unassignedItems = buckets.find((b) => b.id === unassignedId)?.items ?? [];

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.wrapper}>
        <div className={styles.buckets}>
          {buckets
            .filter((b) => b.id !== unassignedId)
            .map((bucket) => (
              <DroppableBucket key={bucket.id} bucket={bucket} />
            ))}
        </div>
        <DroppableUnassigned id={unassignedId} label={unassignedLabel} items={unassignedItems} />
      </div>
      <DragOverlay dropAnimation={dropAnimation}>
        {draggingItem ? <div className={styles.item}>{draggingItem.text}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}

function DroppableBucket({ bucket }: { bucket: Bucket }) {
  const { setNodeRef, isOver } = useDroppable({ id: bucket.id });
  return (
    <div ref={setNodeRef} className={`${styles.bucket} ${isOver ? styles.over : ''}`}>
      <h4 className={styles.bucketTitle}>{bucket.name}</h4>
      <div className={styles.items}>
        {bucket.items.map((item) => (
          <DraggableItem key={item.id} id={item.id} text={item.text} />
        ))}
      </div>
    </div>
  );
}

function DroppableUnassigned({
  id,
  label,
  items,
}: {
  id: string;
  label: string;
  items: BucketItem[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`${styles.unassigned} ${isOver ? styles.over : ''}`}>
      <h4 className={styles.bucketTitle}>{label}</h4>
      <div className={styles.items}>
        {items.map((item) => (
          <DraggableItem key={item.id} id={item.id} text={item.text} />
        ))}
      </div>
    </div>
  );
}

function DraggableItem({ id, text }: { id: string; text: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      className={`${styles.item} ${isDragging ? styles.dragging : ''}`}
      style={style}
      {...listeners}
      {...attributes}
    >
      {text}
    </div>
  );
}

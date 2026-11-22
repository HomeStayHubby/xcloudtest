import { useState, useMemo } from 'react';
import type { Question, QuestionData, QuestionType, BloomLevel } from '@elitequest/shared';
import SortableBucketDnD, { type Bucket } from './SortableBucketDnD.js';
import MatchGraph from './MatchGraph.js';
import { MarkdownEditor } from './MarkdownEditor.js';

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'mcq_single', label: 'Multiple Choice (single)' },
  { value: 'mcq_multi', label: 'Multiple Choice (multi)' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'fill_blanks', label: 'Fill in the Blanks' },
  { value: 'matching', label: 'Matching' },
  { value: 'grouping', label: 'Grouping' },
  { value: 'word_cloud', label: 'Word Cloud' },
  { value: 'brainstorming', label: 'Brainstorming' },
];

export const BLOOM_LEVELS: { value: BloomLevel; label: string }[] = [
  { value: 'remember', label: 'Remember' },
  { value: 'understand', label: 'Understand' },
  { value: 'apply', label: 'Apply' },
];

export function generateId(): string {
  return Math.random().toString(36).slice(2, 8);
}

type Option = { id: string; text: string };
type Segment = { text: string; blank: boolean; answer: string };
type BucketItem = { id: string; text: string };

export function useQuestionEditor() {
  const [type, setTypeState] = useState<QuestionType>('mcq_single');
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<Option[]>([
    { id: generateId(), text: '' },
    { id: generateId(), text: '' },
  ]);
  const [correctOptionId, setCorrectOptionId] = useState('');
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>([]);
  const [allowPartial, setAllowPartial] = useState(false);
  const [partialPoints, setPartialPoints] = useState(0.5);
  const [acceptedAnswers, setAcceptedAnswers] = useState<string[]>(['']);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([
    { text: '', blank: true, answer: '' },
  ]);
  const [leftItems, setLeftItems] = useState<Option[]>([
    { id: generateId(), text: '' },
  ]);
  const [rightItems, setRightItems] = useState<Option[]>([
    { id: generateId(), text: '' },
  ]);
  const [correctPairs, setCorrectPairs] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([
    { id: generateId(), name: '' },
  ]);
  const [groupItems, setGroupItems] = useState<{ id: string; text: string; group_id: string }[]>([
    { id: generateId(), text: '', group_id: '' },
  ]);
  const [maxWords, setMaxWords] = useState(3);
  const [allowUpvotes, setAllowUpvotes] = useState(true);
  const [maxIdeas, setMaxIdeas] = useState<number | undefined>(undefined);
  const [bloomLevel, setBloomLevel] = useState<BloomLevel | ''>('');

  function resetTypeState() {
    setOptions([
      { id: generateId(), text: '' },
      { id: generateId(), text: '' },
    ]);
    setCorrectOptionId('');
    setCorrectOptionIds([]);
    setAllowPartial(false);
    setPartialPoints(0.5);
    setAcceptedAnswers(['']);
    setCaseSensitive(false);
    setSegments([{ text: '', blank: true, answer: '' }]);
    setLeftItems([{ id: generateId(), text: '' }]);
    setRightItems([{ id: generateId(), text: '' }]);
    setCorrectPairs({});
    setGroups([{ id: generateId(), name: '' }]);
    setGroupItems([{ id: generateId(), text: '', group_id: '' }]);
    setMaxWords(3);
    setAllowUpvotes(true);
    setMaxIdeas(undefined);
  }

  function changeType(next: QuestionType) {
    setTypeState(next);
    resetTypeState();
  }

  function reset() {
    setTypeState('mcq_single');
    setPrompt('');
    setBloomLevel('');
    resetTypeState();
  }

  function populate(question: Question) {
    setTypeState(question.type);
    setPrompt(question.prompt);
    setBloomLevel(question.bloom_level ?? '');
    resetTypeState();
    const data = question.data;
    switch (data.type) {
      case 'mcq_single':
        setOptions(data.options);
        setCorrectOptionId(data.correct_option_id);
        break;
      case 'mcq_multi':
        setOptions(data.options);
        setCorrectOptionIds(data.correct_option_ids);
        setAllowPartial(data.allow_partial);
        setPartialPoints(data.partial_points);
        break;
      case 'short_answer':
        setAcceptedAnswers(data.accepted_answers);
        setCaseSensitive(data.case_sensitive);
        break;
      case 'fill_blanks':
        setSegments(data.segments.map((s) => ({ ...s, answer: s.answer ?? '' })));
        break;
      case 'matching':
        setLeftItems(data.left_items);
        setRightItems(data.right_items);
        setCorrectPairs(data.correct_pairs);
        break;
      case 'grouping':
        setGroups(data.groups);
        setGroupItems(data.items);
        break;
      case 'word_cloud':
        setMaxWords(data.max_words_per_student);
        break;
      case 'brainstorming':
        setAllowUpvotes(data.allow_upvotes);
        setMaxIdeas(data.max_ideas_per_student);
        break;
    }
  }

  function buildData(): QuestionData {
    switch (type) {
      case 'mcq_single':
        return {
          type,
          prompt,
          options,
          correct_option_id: correctOptionId,
        };
      case 'mcq_multi':
        return {
          type,
          prompt,
          options,
          correct_option_ids: correctOptionIds,
          allow_partial: allowPartial,
          partial_points: partialPoints,
        };
      case 'short_answer':
        return {
          type,
          prompt,
          accepted_answers: acceptedAnswers.filter(Boolean),
          case_sensitive: caseSensitive,
        };
      case 'fill_blanks':
        return {
          type,
          prompt,
          segments: segments.map((s) => ({
            text: s.text,
            blank: s.blank,
            answer: s.blank ? s.answer : undefined,
          })),
        };
      case 'matching':
        return {
          type,
          prompt,
          left_items: leftItems,
          right_items: rightItems,
          correct_pairs: correctPairs,
        };
      case 'grouping':
        return {
          type,
          prompt,
          groups,
          items: groupItems,
        };
      case 'word_cloud':
        return {
          type,
          prompt,
          max_words_per_student: maxWords,
        };
      case 'brainstorming':
        return {
          type,
          prompt,
          allow_upvotes: allowUpvotes,
          max_ideas_per_student: maxIdeas,
        };
    }
  }

  return {
    type,
    prompt,
    setPrompt,
    changeType,
    reset,
    populate,
    buildData,
    options,
    setOptions,
    correctOptionId,
    setCorrectOptionId,
    correctOptionIds,
    setCorrectOptionIds,
    allowPartial,
    setAllowPartial,
    partialPoints,
    setPartialPoints,
    acceptedAnswers,
    setAcceptedAnswers,
    caseSensitive,
    setCaseSensitive,
    segments,
    setSegments,
    leftItems,
    setLeftItems,
    rightItems,
    setRightItems,
    correctPairs,
    setCorrectPairs,
    groups,
    setGroups,
    groupItems,
    setGroupItems,
    maxWords,
    setMaxWords,
    allowUpvotes,
    setAllowUpvotes,
    maxIdeas,
    setMaxIdeas,
    bloomLevel,
    setBloomLevel,
  };
}

export type QuestionEditor = ReturnType<typeof useQuestionEditor>;

// Optional Bloom's taxonomy tag (levels 1-3). Shown in every question editor
// and auto-filled for AI-generated questions.
export function BloomLevelSelect({
  value,
  onChange,
}: {
  value: BloomLevel | '';
  onChange: (value: BloomLevel | '') => void;
}): JSX.Element {
  return (
    <>
      <label>Bloom&apos;s level (optional)</label>
      <select value={value} onChange={(e) => onChange(e.target.value as BloomLevel | '')}>
        <option value="">— not set —</option>
        {BLOOM_LEVELS.map((level) => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </select>
    </>
  );
}

function McqSingleEditor({
  options,
  setOptions,
  correctOptionId,
  setCorrectOptionId,
}: {
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>;
  correctOptionId: string;
  setCorrectOptionId: (id: string) => void;
}) {
  return (
    <div>
      <label>Options</label>
      {options.map((option, index) => (
        <div key={option.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <textarea
            rows={2}
            placeholder="Option text (can span multiple lines)"
            value={option.text}
            onChange={(e) => {
              const next = [...options];
              next[index].text = e.target.value;
              setOptions(next);
            }}
            required
          />
          <input
            type="radio"
            name="correct_option"
            checked={correctOptionId === option.id}
            onChange={() => setCorrectOptionId(option.id)}
            style={{ width: 'auto' }}
          />
          <button
            type="button"
            className="secondary"
            onClick={() => setOptions(options.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setOptions([...options, { id: generateId(), text: '' }])}>
        Add Option
      </button>
    </div>
  );
}

function McqMultiEditor({
  options,
  setOptions,
  correctOptionIds,
  setCorrectOptionIds,
  allowPartial,
  setAllowPartial,
  partialPoints,
  setPartialPoints,
}: {
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>;
  correctOptionIds: string[];
  setCorrectOptionIds: (ids: string[]) => void;
  allowPartial: boolean;
  setAllowPartial: (value: boolean) => void;
  partialPoints: number;
  setPartialPoints: (value: number) => void;
}) {
  function toggle(id: string) {
    if (correctOptionIds.includes(id)) {
      setCorrectOptionIds(correctOptionIds.filter((x) => x !== id));
    } else {
      setCorrectOptionIds([...correctOptionIds, id]);
    }
  }

  return (
    <div>
      <label>Options</label>
      {options.map((option, index) => (
        <div key={option.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <textarea
            rows={2}
            placeholder="Option text (can span multiple lines)"
            value={option.text}
            onChange={(e) => {
              const next = [...options];
              next[index].text = e.target.value;
              setOptions(next);
            }}
            required
          />
          <input
            type="checkbox"
            checked={correctOptionIds.includes(option.id)}
            onChange={() => toggle(option.id)}
            style={{ width: 'auto' }}
          />
          <button
            type="button"
            className="secondary"
            onClick={() => setOptions(options.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setOptions([...options, { id: generateId(), text: '' }])}>
        Add Option
      </button>
      <div style={{ marginTop: '0.75rem' }}>
        <label>
          <input
            type="checkbox"
            checked={allowPartial}
            onChange={(e) => setAllowPartial(e.target.checked)}
            style={{ width: 'auto' }}
          />
          Allow partial credit
        </label>
      </div>
      {allowPartial && (
        <>
          <label>Penalty per wrong selection</label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={partialPoints}
            onChange={(e) => setPartialPoints(Number(e.target.value))}
          />
        </>
      )}
    </div>
  );
}

function ShortAnswerEditor({
  acceptedAnswers,
  setAcceptedAnswers,
  caseSensitive,
  setCaseSensitive,
}: {
  acceptedAnswers: string[];
  setAcceptedAnswers: (answers: string[]) => void;
  caseSensitive: boolean;
  setCaseSensitive: (value: boolean) => void;
}) {
  return (
    <div>
      <label>Accepted Answers</label>
      {acceptedAnswers.map((answer, index) => (
        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            value={answer}
            onChange={(e) => {
              const next = [...acceptedAnswers];
              next[index] = e.target.value;
              setAcceptedAnswers(next);
            }}
            required
          />
          <button
            type="button"
            className="secondary"
            onClick={() => setAcceptedAnswers(acceptedAnswers.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setAcceptedAnswers([...acceptedAnswers, ''])}>
        Add Answer
      </button>
      <label>
        <input
          type="checkbox"
          checked={caseSensitive}
          onChange={(e) => setCaseSensitive(e.target.checked)}
        />
        Case sensitive
      </label>
    </div>
  );
}

function FillBlanksEditor({
  segments,
  setSegments,
}: {
  segments: Segment[];
  setSegments: React.Dispatch<React.SetStateAction<Segment[]>>;
}) {
  return (
    <div>
      <label>Segments (text + blanks)</label>
      {segments.map((segment, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '0.5rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            placeholder="Text shown to student"
            value={segment.text}
            onChange={(e) => {
              const next = [...segments];
              next[index].text = e.target.value;
              setSegments(next);
            }}
          />
          <label>
            <input
              type="checkbox"
              checked={segment.blank}
              onChange={(e) => {
                const next = [...segments];
                next[index].blank = e.target.checked;
                setSegments(next);
              }}
            />
            Blank
          </label>
          {segment.blank && (
            <input
              placeholder="Answer"
              value={segment.answer}
              onChange={(e) => {
                const next = [...segments];
                next[index].answer = e.target.value;
                setSegments(next);
              }}
            />
          )}
          <button
            type="button"
            className="secondary"
            onClick={() => setSegments(segments.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setSegments([...segments, { text: '', blank: true, answer: '' }])}>
        Add Segment
      </button>
    </div>
  );
}

function MatchingEditor({
  leftItems,
  setLeftItems,
  rightItems,
  setRightItems,
  correctPairs,
  setCorrectPairs,
}: {
  leftItems: Option[];
  setLeftItems: React.Dispatch<React.SetStateAction<Option[]>>;
  rightItems: Option[];
  setRightItems: React.Dispatch<React.SetStateAction<Option[]>>;
  correctPairs: Record<string, string>;
  setCorrectPairs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  return (
    <div>
      <label>Left Items</label>
      {leftItems.map((item, index) => (
        <div key={item.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            value={item.text}
            onChange={(e) => {
              const next = [...leftItems];
              next[index].text = e.target.value;
              setLeftItems(next);
            }}
            required
          />
          <button
            type="button"
            className="secondary"
            onClick={() => setLeftItems(leftItems.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setLeftItems([...leftItems, { id: generateId(), text: '' }])}>
        Add Left Item
      </button>

      <label>Right Items</label>
      {rightItems.map((item, index) => (
        <div key={item.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            value={item.text}
            onChange={(e) => {
              const next = [...rightItems];
              next[index].text = e.target.value;
              setRightItems(next);
            }}
            required
          />
          <button
            type="button"
            className="secondary"
            onClick={() => setRightItems(rightItems.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setRightItems([...rightItems, { id: generateId(), text: '' }])}>
        Add Right Item
      </button>

      <label>Correct Pairs</label>
      {leftItems.length > 0 && rightItems.length > 0 && (
        <MatchGraph
          leftItems={leftItems}
          rightItems={rightItems}
          pairs={correctPairs}
          onChange={setCorrectPairs}
        />
      )}
      {(leftItems.length === 0 || rightItems.length === 0) && (
        <p>Add left and right items first.</p>
      )}
    </div>
  );
}

function GroupingEditor({
  groups,
  setGroups,
  items,
  setItems,
}: {
  groups: { id: string; name: string }[];
  setGroups: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>;
  items: { id: string; text: string; group_id: string }[];
  setItems: React.Dispatch<React.SetStateAction<{ id: string; text: string; group_id: string }[]>>;
}) {
  const buckets = useMemo<Bucket[]>(() => {
    const answerBuckets = groups.map((g) => ({ id: g.id, name: g.name, items: [] as BucketItem[] }));
    const unassigned: Bucket = { id: '__unassigned__', name: 'Drag items here', items: [] };
    const lookup = new Map<string, Bucket>([...answerBuckets.map((b) => [b.id, b] as const), ['__unassigned__', unassigned]]);
    items.forEach((item) => {
      const bucket = lookup.get(item.group_id) ?? unassigned;
      bucket.items.push({ id: item.id, text: item.text });
    });
    return [...answerBuckets, unassigned];
  }, [groups, items]);

  function updateFromBuckets(nextBuckets: Bucket[]) {
    const groupMap = new Map<string, string>();
    nextBuckets.forEach((bucket) => {
      bucket.items.forEach((item) => {
        groupMap.set(item.id, bucket.id);
      });
    });
    setItems((prev) =>
      prev.map((item) => ({ ...item, group_id: groupMap.get(item.id) ?? '' }))
    );
  }

  return (
    <div>
      <label>Groups</label>
      {groups.map((group, index) => (
        <div key={group.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            placeholder="Group name"
            value={group.name}
            onChange={(e) => {
              const next = [...groups];
              next[index].name = e.target.value;
              setGroups(next);
            }}
            required
          />
          <button
            type="button"
            className="secondary"
            onClick={() => {
              const nextGroups = groups.filter((_, i) => i !== index);
              setGroups(nextGroups);
              setItems((prev) =>
                prev.map((it) =>
                  it.group_id === group.id ? { ...it, group_id: '' } : it
                )
              );
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setGroups([...groups, { id: generateId(), name: '' }])}>
        Add Group
      </button>

      <label>Items</label>
      {items.map((item, index) => (
        <div key={item.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            placeholder="Item text"
            value={item.text}
            onChange={(e) => {
              const next = [...items];
              next[index].text = e.target.value;
              setItems(next);
            }}
            required
          />
          <button
            type="button"
            className="secondary"
            onClick={() => setItems(items.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setItems([...items, { id: generateId(), text: '', group_id: '' }])}>
        Add Item
      </button>

      {groups.length > 0 && items.length > 0 && (
        <>
          <label>Assign items to groups</label>
          <SortableBucketDnD
            buckets={buckets.filter((b) => b.id !== '__unassigned__')}
            onChange={updateFromBuckets}
            unassignedId="__unassigned__"
            unassignedLabel="Unassigned"
          />
        </>
      )}
    </div>
  );
}

function WordCloudEditor({
  maxWords,
  setMaxWords,
}: {
  maxWords: number;
  setMaxWords: (value: number) => void;
}) {
  return (
    <div>
      <label>Max words per student</label>
      <input
        type="number"
        min={1}
        value={maxWords}
        onChange={(e) => setMaxWords(Number(e.target.value))}
      />
    </div>
  );
}

function BrainstormEditor({
  allowUpvotes,
  setAllowUpvotes,
  maxIdeas,
  setMaxIdeas,
}: {
  allowUpvotes: boolean;
  setAllowUpvotes: (value: boolean) => void;
  maxIdeas: number | undefined;
  setMaxIdeas: (value: number | undefined) => void;
}) {
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={allowUpvotes}
          onChange={(e) => setAllowUpvotes(e.target.checked)}
        />
        Allow upvotes
      </label>
      <label>Max ideas per student (optional)</label>
      <input
        type="number"
        min={1}
        value={maxIdeas ?? ''}
        onChange={(e) => {
          const value = e.target.value;
          setMaxIdeas(value ? Number(value) : undefined);
        }}
      />
    </div>
  );
}

export function QuestionTypeFields({ editor }: { editor: QuestionEditor }): JSX.Element {
  return (
    <>
      <label>Type</label>
      <select
        value={editor.type}
        onChange={(e) => editor.changeType(e.target.value as QuestionType)}
      >
        {QUESTION_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <label>Prompt (supports Markdown — see cheat sheet below)</label>
      <MarkdownEditor
        value={editor.prompt}
        onChange={editor.setPrompt}
        rows={6}
        required
        placeholder={'Write the question. A blank line starts a new paragraph; a ``` code block keeps lines and indentation as typed.'}
      />

      {editor.type === 'mcq_single' && (
        <McqSingleEditor
          options={editor.options}
          setOptions={editor.setOptions}
          correctOptionId={editor.correctOptionId}
          setCorrectOptionId={editor.setCorrectOptionId}
        />
      )}
      {editor.type === 'mcq_multi' && (
        <McqMultiEditor
          options={editor.options}
          setOptions={editor.setOptions}
          correctOptionIds={editor.correctOptionIds}
          setCorrectOptionIds={editor.setCorrectOptionIds}
          allowPartial={editor.allowPartial}
          setAllowPartial={editor.setAllowPartial}
          partialPoints={editor.partialPoints}
          setPartialPoints={editor.setPartialPoints}
        />
      )}
      {editor.type === 'short_answer' && (
        <ShortAnswerEditor
          acceptedAnswers={editor.acceptedAnswers}
          setAcceptedAnswers={editor.setAcceptedAnswers}
          caseSensitive={editor.caseSensitive}
          setCaseSensitive={editor.setCaseSensitive}
        />
      )}
      {editor.type === 'fill_blanks' && (
        <FillBlanksEditor segments={editor.segments} setSegments={editor.setSegments} />
      )}
      {editor.type === 'matching' && (
        <MatchingEditor
          leftItems={editor.leftItems}
          setLeftItems={editor.setLeftItems}
          rightItems={editor.rightItems}
          setRightItems={editor.setRightItems}
          correctPairs={editor.correctPairs}
          setCorrectPairs={editor.setCorrectPairs}
        />
      )}
      {editor.type === 'grouping' && (
        <GroupingEditor
          groups={editor.groups}
          setGroups={editor.setGroups}
          items={editor.groupItems}
          setItems={editor.setGroupItems}
        />
      )}
      {editor.type === 'word_cloud' && (
        <WordCloudEditor maxWords={editor.maxWords} setMaxWords={editor.setMaxWords} />
      )}
      {editor.type === 'brainstorming' && (
        <BrainstormEditor
          allowUpvotes={editor.allowUpvotes}
          setAllowUpvotes={editor.setAllowUpvotes}
          maxIdeas={editor.maxIdeas}
          setMaxIdeas={editor.setMaxIdeas}
        />
      )}
    </>
  );
}

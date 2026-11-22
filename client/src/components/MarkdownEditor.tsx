import { useEffect, useRef, useState } from 'react';
import styles from './MarkdownEditor.module.css';
import { MarkdownText } from './MarkdownText.js';

type Snippet = {
  label: string;
  title: string;
  prefix: string;
  suffix?: string;
  placeholder: string;
  block?: boolean;
};

const SNIPPETS: Snippet[] = [
  { label: 'B', title: 'Bold', prefix: '**', suffix: '**', placeholder: 'bold text' },
  { label: 'I', title: 'Italic', prefix: '*', suffix: '*', placeholder: 'italic text' },
  { label: '</>', title: 'Inline code', prefix: '`', suffix: '`', placeholder: 'code' },
  {
    label: 'Code block',
    title: 'Code block — keeps lines and indentation exactly as typed',
    prefix: '```\n',
    suffix: '\n```',
    placeholder: 'first line\n    indented line',
    block: true,
  },
  { label: '• List', title: 'Bullet list', prefix: '- ', placeholder: 'list item', block: true },
  { label: '1. List', title: 'Numbered list', prefix: '1. ', placeholder: 'list item', block: true },
  { label: 'Heading', title: 'Section heading', prefix: '### ', placeholder: 'Heading', block: true },
  {
    label: 'Link',
    title: 'Link',
    prefix: '[',
    suffix: '](https://example.com)',
    placeholder: 'link text',
  },
];

type MarkdownEditorProps = {
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
};

export function MarkdownEditor({
  value,
  onChange,
  rows = 6,
  placeholder,
  required,
}: MarkdownEditorProps): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<[number, number] | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (!pendingSelection.current || !el) return;
    const [start, end] = pendingSelection.current;
    el.focus();
    el.setSelectionRange(start, end);
    pendingSelection.current = null;
  }, [value]);

  function insert(snippet: Snippet) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const core = selected.length > 0 ? selected : snippet.placeholder;
    const body = snippet.prefix + core + (snippet.suffix ?? '');
    const pad = snippet.block && start > 0 && value[start - 1] !== '\n' ? '\n' : '';
    onChange(value.slice(0, start) + pad + body + value.slice(end));
    const coreStart = start + pad.length + snippet.prefix.length;
    pendingSelection.current = [coreStart, coreStart + core.length];
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        {SNIPPETS.map((snippet) => (
          <button
            key={snippet.label}
            type="button"
            className="secondary"
            title={snippet.title}
            onClick={() => insert(snippet)}
          >
            {snippet.label}
          </button>
        ))}
        <button
          type="button"
          className={showPreview ? undefined : 'secondary'}
          title="Toggle preview of the formatted question"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {showPreview ? (
        value.trim().length > 0 ? (
          <div className={styles.preview}>
            <MarkdownText text={value} />
          </div>
        ) : (
          <div className={styles.preview}>Nothing to preview yet.</div>
        )
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          required={required}
          className={styles.textarea}
        />
      )}
      <details className={styles.cheatsheet}>
        <summary>Markdown cheat sheet</summary>
        <div>
          <p>
            <code>**bold**</code>, <code>*italic*</code>, <code>`code`</code>,{' '}
            <code>[link](https://...)</code>. A blank line starts a new paragraph.
          </p>
          <p>
            A <code>```</code> code block keeps lines and indentation exactly as typed:
          </p>
          <pre>{'```\nfirst line\n    indented    line\n    another    line\n```'}</pre>
        </div>
      </details>
    </div>
  );
}

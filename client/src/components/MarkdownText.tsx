import { useMemo } from 'react';
import { renderMarkdown } from '../lib/markdown.js';

type MarkdownTextTag = 'div' | 'span' | 'p' | 'h3' | 'h4';

type MarkdownTextProps = {
  text: string;
  tag?: MarkdownTextTag;
  className?: string;
};

export function MarkdownText({ text, tag, className }: MarkdownTextProps): JSX.Element {
  const html = useMemo(() => renderMarkdown(text), [text]);
  const Tag = tag ?? 'div';
  const classes = className ? `rich-text ${className}` : 'rich-text';
  return <Tag className={classes} dangerouslySetInnerHTML={{ __html: html }} />;
}

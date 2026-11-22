import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

// html: false — raw HTML typed into the source is escaped, never executed.
// breaks: true — single newlines become <br>, so legacy plain-text prompts
// written with line breaks render the same as before markdown support.
const md = new MarkdownIt({ html: false, breaks: true, linkify: true });

export function renderMarkdown(source: string): string {
  const rendered = md.render(source);
  return DOMPurify.sanitize(rendered, { USE_PROFILES: { html: true } });
}

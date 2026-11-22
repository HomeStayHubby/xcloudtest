import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown.js';

describe('renderMarkdown', () => {
  it('renders paragraphs, bold, italic, and inline code', () => {
    const html = renderMarkdown('Hello **world** and *stars* and `code`');
    expect(html).toContain('<strong>world</strong>');
    expect(html).toContain('<em>stars</em>');
    expect(html).toContain('<code>code</code>');
  });

  it('renders separate paragraphs', () => {
    const html = renderMarkdown('first paragraph\n\nsecond paragraph');
    expect(html).toContain('<p>first paragraph</p>');
    expect(html).toContain('<p>second paragraph</p>');
  });

  it('converts single newlines to line breaks', () => {
    const html = renderMarkdown('line one\nline two');
    expect(html).toContain('<br');
  });

  it('renders fenced code blocks preserving lines and indentation', () => {
    const html = renderMarkdown('```\nfirst line\n    indented line\n```');
    expect(html).toContain('<pre><code>');
    expect(html).toContain('    indented line');
  });

  it('escapes raw HTML in the source', () => {
    const html = renderMarkdown('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('never renders a javascript link', () => {
    const html = renderMarkdown('[click](javascript:alert(1))');
    expect(html).not.toContain('href="javascript:');
  });

  it('renders legacy plain text essentially unchanged', () => {
    const html = renderMarkdown('What is 2 + 2?');
    expect(html).toContain('What is 2 + 2?');
    expect(html).not.toContain('<a ');
  });
});

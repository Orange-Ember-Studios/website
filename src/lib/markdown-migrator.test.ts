import { describe, it, expect } from 'vitest';
import { editorJsToMarkdown } from './markdown-migrator.ts';

describe('editorJsToMarkdown', () => {
  it('should convert paragraphs', () => {
    const blocks = [
      { type: 'paragraph', data: { text: 'Hello world' } }
    ];
    expect(editorJsToMarkdown(blocks)).toBe('Hello world\n\n');
  });

  it('should convert headers', () => {
    const blocks = [
      { type: 'header', data: { text: 'Title', level: 2 } }
    ];
    expect(editorJsToMarkdown(blocks)).toBe('## Title\n\n');
  });

  it('should convert lists', () => {
    const blocks = [
      { type: 'list', data: { style: 'unordered', items: ['Item 1', 'Item 2'] } }
    ];
    expect(editorJsToMarkdown(blocks)).toBe('- Item 1\n- Item 2\n\n');
  });
});

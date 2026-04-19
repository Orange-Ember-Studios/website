import { describe, it, expect } from 'vitest';
import { parseEditorJsBlocks } from './editorjs-parser';

describe('editorjs-parser', () => {
  it('should parse code blocks and return highlighted HTML', async () => {
    const blocks = [
      {
        type: 'code',
        data: {
          code: 'console.log("hello world");',
        }
      }
    ];

    const html = await parseEditorJsBlocks(blocks);
    
    // Check if it contains some Shiki markers or classes (it will if we use Shiki)
    // Initially this will fail because parseEditorJsBlocks is sync and returns plain pre
    expect(html).toContain('<pre');
    expect(html).toContain('shiki'); // We expect Shiki to be used
    expect(html).toContain('console.log');
  });

  it('should parse GDScript blocks correctly', async () => {
    const blocks = [
      {
        type: 'code',
        data: {
          code: 'func _ready():\n    print("Hello Godot")',
          language: 'gdscript'
        }
      }
    ];

    const html = await parseEditorJsBlocks(blocks);
    
    expect(html).toContain('gdscript');
    expect(html).toContain('func');
    expect(html).toContain('_ready');
    expect(html).toContain('print');
  });

  it('should parse paragraphs with inline code', async () => {
    const blocks = [
      {
        type: 'paragraph',
        data: {
          text: 'Enjoy `this code` example.',
        }
      }
    ];

    const html = await parseEditorJsBlocks(blocks);
    expect(html).toContain('<code');
    expect(html).toContain('bg-neutral-800'); // Check current implementation style
  });
});

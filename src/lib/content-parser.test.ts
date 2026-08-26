import { describe, it, expect } from 'vitest';
import { parseEditorJsBlocks } from './content-parser.ts';

describe('content-parser', () => {
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
    
    expect(html).toContain('GDScript');
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

describe('content-parser code languages', () => {
  it('labels the block with the selected language', async () => {
    const html = await parseEditorJsBlocks([
      { type: 'code', data: { code: 'var x := 1', language: 'gdscript' } },
    ]);
    expect(html).toContain('GDScript');
  });

  it('defaults legacy blocks without a language to GDScript', async () => {
    const html = await parseEditorJsBlocks([
      { type: 'code', data: { code: 'func _ready():' } },
    ]);
    expect(html).toContain('GDScript');
    expect(html).toContain('shiki');
  });

  it('normalizes aliased languages', async () => {
    const html = await parseEditorJsBlocks([
      { type: 'code', data: { code: 'int main(){}', language: 'c++' } },
    ]);
    expect(html).toContain('C++');
  });

  it('does not break the post when the language is unsupported', async () => {
    const html = await parseEditorJsBlocks([
      { type: 'code', data: { code: '<script>x</script>', language: 'klingon' } },
      { type: 'paragraph', data: { text: 'Still rendered' } },
    ]);
    expect(html).toContain('Still rendered');
    expect(html).not.toContain('<script>x</script>');
  });
});

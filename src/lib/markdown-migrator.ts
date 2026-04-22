export function editorJsToMarkdown(blocks: any[]): string {
  return blocks.reduce((acc, block) => {
    switch (block.type) {
      case 'paragraph':
        return acc + `${block.data.text}\n\n`;
      case 'header':
        const hashes = '#'.repeat(block.data.level);
        return acc + `${hashes} ${block.data.text}\n\n`;
      case 'list':
        const prefix = block.data.style === 'ordered' ? '1. ' : '- ';
        const list = block.data.items.map((item: any) => {
          const text = typeof item === 'string' ? item : (item.content || '');
          return `${prefix}${text}`;
        }).join('\n');
        return acc + `${list}\n\n`;
      case 'quote':
        return acc + `> ${block.data.text}\n\n`;
      case 'code':
        return acc + `\`\`\`${block.data.language || ''}\n${block.data.code}\n\`\`\`\n\n`;
      default:
        return acc;
    }
  }, '');
}

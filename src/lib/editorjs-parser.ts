function processText(text: string): string {
  if (!text) return "";
  // Robust substitution that handles potential encoding and nested styles
  return text
    .replace(/&grave;|&#96;/g, '`') // Pre-normalize possible entities
    .replace(/`(.+?)`/g, (match, code) => {
      return `<code class="bg-neutral-800 text-orange-400 px-1.5 py-0.5 rounded font-mono text-xs mx-0.5 border border-white/5 whitespace-nowrap">${code}</code>`;
    });
}

export function parseEditorJsBlocks(blocks: any[]): string {
  let html = '';
  
  for (const block of blocks) {
    switch (block.type) {
      case 'header':
        const level = block.data.level || 2;
        html += `<h${level} class="text-3xl font-bold mt-8 mb-4 text-white">${processText(block.data.text)}</h${level}>`;
        break;
      case 'paragraph':
        html += `<p class="mb-4 text-neutral-300 leading-relaxed">${processText(block.data.text)}</p>`;
        break;
      case 'list':
        const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
        const listClass = block.data.style === 'ordered' ? 'list-decimal pl-5 mb-4' : 'list-disc pl-5 mb-4';
        // Handle both simple string items and newer EditorJS nested object items
        const items = block.data.items.map((item: any) => {
          const content = typeof item === 'string' ? item : (item.content || '');
          return `<li class="mb-1 text-neutral-300">${processText(content)}</li>`;
        }).join('');
        html += `<${tag} class="${listClass}">${items}</${tag}>`;
        break;
      case 'quote':
        html += `<blockquote class="border-l-4 border-orange-500 pl-4 py-2 mt-6 mb-6 bg-neutral-900 italic text-neutral-300">"${processText(block.data.text)}"</blockquote>`;
        break;
      case 'image':
        const url = block.data.file?.url || block.data.url;
        html += `<img src="${url}" alt="${block.data.caption || 'Image'}" class="w-full rounded-xl my-6" />`;
        if (block.data.caption) {
          html += `<p class="text-xs text-neutral-500 text-center mb-6">${processText(block.data.caption)}</p>`;
        }
        break;
      case 'code':
        html += `<pre class="bg-neutral-900 border border-neutral-800 p-4 rounded-lg my-6 font-mono text-sm inline-block w-full overflow-x-auto text-orange-400"><code>${block.data.code}</code></pre>`;
        break;
    }
  }

  return html;
}

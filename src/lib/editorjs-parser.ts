import { createHighlighter } from 'shiki';

let highlighter: any;

async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'vue', 'astro', 'html', 'css', 'json', 'markdown', 'bash', 'yaml', 'csharp', 'cpp', 'python', 'sql', 'gdscript'],
    });
  }
  return highlighter;
}

function processText(text: string): string {
  if (!text) return "";
  // Robust substitution that handles potential encoding and nested styles
  return text
    .replace(/&grave;|&#96;/g, '`') // Pre-normalize possible entities
    .replace(/`(.+?)`/g, (match, code) => {
      return `<code class="bg-neutral-800 text-orange-400 px-1.5 py-0.5 rounded font-mono text-xs mx-0.5 border border-white/5 whitespace-nowrap">${code}</code>`;
    });
}

export async function parseEditorJsBlocks(blocks: any[]): Promise<string> {
  let html = '';
  const highlighter = await getHighlighter();
  
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
        const language = block.data.language || 'javascript';
        const code = block.data.code || '';
        const highlighted = highlighter.codeToHtml(code, {
          lang: language,
          theme: 'github-dark'
        });
        
        html += `
          <div class="code-block-wrapper my-8 group relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d1117]">
            <div class="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/10">
              <span class="text-xs font-mono text-gray-400 font-medium uppercase tracking-wider">${language}</span>
              <button 
                class="copy-button p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 flex items-center gap-2 group/btn"
                data-code="${encodeURIComponent(code)}"
              >
                <svg class="w-4 h-4 transition-transform group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span class="text-xs font-bold opacity-0 group-hover/btn:opacity-100 transition-opacity">Copy</span>
              </button>
            </div>
            <div class="p-1 overflow-x-auto custom-scrollbar">
              ${highlighted}
            </div>
          </div>
        `;
        break;
    }
  }

  return html;
}

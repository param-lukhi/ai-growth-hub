/**
 * Custom Markdown & HTML parser for rendering blog posts with full formatting:
 * Headings (#, ##, ###), Tables (| col | col |), Lists (* item, - item), Bold (**text**), 
 * Italics (*text*), Horizontal rules (---), and line breaks.
 */
export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const trimmed = markdown.trim();
  let html = trimmed;

  // 1. Normalize line endings
  html = html.replace(/\r\n/g, '\n');

  // 2. Parse Markdown Tables
  const tableRegex = /^\|(.+)\|\n\|(?:\s*[-:]+[-|\s:]*)\|\n((?:\|.+\|\n?)+)/gm;
  html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
    const headers = headerRow
      .split('|')
      .map((h: string) => h.trim())
      .filter((h: string) => h.length > 0);

    const rows = bodyRows
      .trim()
      .split('\n')
      .map((row: string) =>
        row
          .split('|')
          .map((cell: string) => cell.trim())
          .filter((cell: string) => cell.length > 0)
      );

    const thead = `<thead><tr class="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-extrabold border-b border-neutral-200 dark:border-neutral-700">${headers
      .map((h: string) => `<th class="p-3 border-r border-neutral-200 dark:border-neutral-700 text-left text-xs uppercase tracking-wider">${formatInlineMarkdown(h)}</th>`)
      .join('')}</tr></thead>`;

    const tbody = `<tbody>${rows
      .map(
        (r: string[], idx: number) =>
          `<tr class="${idx % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/50 dark:bg-neutral-800/30'} border-b border-neutral-100 dark:border-neutral-800">${r
            .map((cell: string) => `<td class="p-3 border-r border-neutral-200/60 dark:border-neutral-800 text-sm">${formatInlineMarkdown(cell)}</td>`)
            .join('')}</tr>`
      )
      .join('')}</tbody>`;

    return `<div class="overflow-x-auto my-6 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs"><table class="w-full text-left text-xs border-collapse">${thead}${tbody}</table></div>`;
  });

  // 3. Parse Block Quotes ( > Quote text )
  html = html.replace(/^>\s*(.+)$/gm, '<blockquote class="border-l-4 border-brand-500 pl-4 py-2 my-4 italic bg-brand-50/40 dark:bg-brand-950/20 rounded-r-xl font-serif text-neutral-800 dark:text-neutral-200">$1</blockquote>');

  // 4. Parse Headings
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-lg font-bold text-neutral-900 dark:text-white mt-6 mb-2 tracking-tight">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-extrabold text-neutral-900 dark:text-white mt-8 mb-3 tracking-tight border-b border-neutral-100 dark:border-neutral-800 pb-2">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mt-10 mb-4 tracking-tight border-b-2 border-brand-500/30 pb-2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white mt-10 mb-4 tracking-tight">$1</h1>');

  // 5. Parse Horizontal Rules (--- or ***)
  html = html.replace(/^[\*\-]{3,}$/gm, '<hr class="my-8 border-t border-neutral-200 dark:border-neutral-800" />');

  // 6. Parse Lists (* item or - item)
  const listRegex = /(?:^|\n)((?:(?:[*\-]\s+.+)|(?:\d+\.\s+.+))(?:\n(?:[*\-]\s+.+)|(?:\n\d+\.\s+.+))*)/g;
  html = html.replace(listRegex, (match, listBlock) => {
    const lines = listBlock.trim().split('\n');
    const isNumbered = /^\d+\./.test(lines[0].trim());
    const tag = isNumbered ? 'ol' : 'ul';
    const listClass = isNumbered
      ? 'list-decimal list-outside ml-6 space-y-2 my-4 text-neutral-800 dark:text-neutral-200 text-base font-sans'
      : 'list-disc list-outside ml-6 space-y-2 my-4 text-neutral-800 dark:text-neutral-200 text-base font-sans';

    const items = lines
      .map((line: string) => {
        const cleaned = line.replace(/^(?:[*\-]\s+|\d+\.\s+)/, '');
        return `<li>${formatInlineMarkdown(cleaned)}</li>`;
      })
      .join('');

    return `<${tag} class="${listClass}">${items}</${tag}>`;
  });

  // 7. Format Paragraphs (Split by double newlines, wrap in <p>)
  const blocks = html.split(/\n{2,}/);
  const formattedBlocks = blocks.map((block) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return '';

    // If block is already wrapped in HTML container tag, don't wrap in <p>
    if (/^<(h[1-6]|div|table|ul|ol|blockquote|hr|section|p|iframe|img)/i.test(trimmedBlock)) {
      return trimmedBlock;
    }

    // Format single line breaks inside paragraph into <br />
    const formattedParagraph = formatInlineMarkdown(trimmedBlock).replace(/\n/g, '<br />');
    return `<p class="mb-5 leading-relaxed text-neutral-800 dark:text-neutral-200 text-base sm:text-lg font-sans">${formattedParagraph}</p>`;
  });

  return formattedBlocks.join('\n');
}

/**
 * Format inline markdown syntax like **bold**, *italic*, `code`, and [links](url)
 */
function formatInlineMarkdown(text: string): string {
  if (!text) return '';
  let formatted = text;

  // Bold **text** or __text__
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-neutral-900 dark:text-white">$1</strong>');
  formatted = formatted.replace(/__(.*?)__/g, '<strong class="font-extrabold text-neutral-900 dark:text-white">$1</strong>');

  // Italic *text* or _text_
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  formatted = formatted.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

  // Inline code `code`
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs font-mono text-brand-600 dark:text-brand-400 border border-neutral-200 dark:border-neutral-700">$1</code>');

  // Links [label](url)
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-600 dark:text-brand-400 font-bold underline underline-offset-2 hover:text-brand-700">$1</a>');

  return formatted;
}

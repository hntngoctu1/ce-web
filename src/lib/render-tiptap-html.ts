/**
 * Server-side Tiptap JSON to HTML renderer
 * Pure TypeScript implementation - no external tiptap dependencies for server rendering
 * This avoids module resolution issues in Next.js server components
 */

interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarks(text: string, marks?: TiptapNode['marks']): string {
  if (!marks || marks.length === 0) return escapeHtml(text);

  let result = escapeHtml(text);

  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
      case 'strong':
        result = `<strong>${result}</strong>`;
        break;
      case 'italic':
      case 'em':
        result = `<em>${result}</em>`;
        break;
      case 'underline':
        result = `<u>${result}</u>`;
        break;
      case 'strike':
        result = `<s>${result}</s>`;
        break;
      case 'code':
        result = `<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">${result}</code>`;
        break;
      case 'link': {
        const href = mark.attrs?.href ? escapeHtml(String(mark.attrs.href)) : '#';
        const target = mark.attrs?.target
          ? ` target="${escapeHtml(String(mark.attrs.target))}"`
          : '';
        const rel = mark.attrs?.target === '_blank' ? ' rel="noopener noreferrer"' : '';
        result = `<a href="${href}"${target}${rel} class="text-ce-primary underline hover:text-ce-secondary">${result}</a>`;
        break;
      }
      case 'textStyle': {
        const styles: string[] = [];
        if (mark.attrs?.color) styles.push(`color: ${mark.attrs.color}`);
        if (mark.attrs?.backgroundColor)
          styles.push(`background-color: ${mark.attrs.backgroundColor}`);
        if (styles.length > 0) {
          result = `<span style="${styles.join('; ')}">${result}</span>`;
        }
        break;
      }
    }
  }

  return result;
}

function renderNode(node: TiptapNode): string {
  const { type, attrs, content, text, marks } = node;

  // Text node
  if (type === 'text' && text !== undefined) {
    return renderMarks(text, marks);
  }

  // Render children
  const children = content ? content.map(renderNode).join('') : '';

  // Handle different node types
  switch (type) {
    case 'doc':
      return children;

    case 'paragraph': {
      if (!children && (!content || content.length === 0)) {
        return '<p><br></p>';
      }
      const align = attrs?.textAlign as string | undefined;
      const style = align && align !== 'left' ? ` style="text-align: ${align}"` : '';
      return `<p${style}>${children}</p>`;
    }

    case 'heading': {
      const level = (attrs?.level as number) || 1;
      const align = attrs?.textAlign as string | undefined;
      const style = align && align !== 'left' ? ` style="text-align: ${align}"` : '';
      const classes: Record<number, string> = {
        1: 'text-3xl font-bold mt-8 mb-4',
        2: 'text-2xl font-bold mt-6 mb-3',
        3: 'text-xl font-semibold mt-5 mb-2',
        4: 'text-lg font-semibold mt-4 mb-2',
        5: 'text-base font-semibold mt-3 mb-1',
        6: 'text-sm font-semibold mt-2 mb-1',
      };
      return `<h${level} class="${classes[level] || ''}"${style}>${children}</h${level}>`;
    }

    case 'bulletList':
      return `<ul class="list-disc pl-6 my-4 space-y-1">${children}</ul>`;

    case 'orderedList': {
      const start = attrs?.start as number | undefined;
      const startAttr = start && start !== 1 ? ` start="${start}"` : '';
      return `<ol class="list-decimal pl-6 my-4 space-y-1"${startAttr}>${children}</ol>`;
    }

    case 'listItem':
      return `<li>${children}</li>`;

    case 'taskList':
      return `<ul class="list-none pl-0 my-4 space-y-2">${children}</ul>`;

    case 'taskItem': {
      const checked = attrs?.checked ? 'checked' : '';
      const checkedClass = attrs?.checked ? 'line-through text-muted-foreground' : '';
      return `<li class="flex items-start gap-2"><input type="checkbox" ${checked} disabled class="mt-1" /><span class="${checkedClass}">${children}</span></li>`;
    }

    case 'blockquote':
      return `<blockquote class="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 italic text-muted-foreground">${children}</blockquote>`;

    case 'codeBlock': {
      const language = attrs?.language as string | undefined;
      const langClass = language ? ` language-${escapeHtml(language)}` : '';
      return `<pre class="rounded-lg bg-slate-900 text-slate-100 p-4 my-4 overflow-x-auto"><code class="font-mono text-sm${langClass}">${children}</code></pre>`;
    }

    case 'horizontalRule':
      return '<hr class="my-8 border-slate-200 dark:border-slate-700">';

    case 'hardBreak':
      return '<br>';

    case 'image': {
      const src = attrs?.src ? escapeHtml(String(attrs.src)) : '';
      const alt = attrs?.alt ? escapeHtml(String(attrs.alt)) : '';
      const title = attrs?.title ? ` title="${escapeHtml(String(attrs.title))}"` : '';
      const width = attrs?.width ? ` width="${attrs.width}"` : '';
      const height = attrs?.height ? ` height="${attrs.height}"` : '';
      return `<figure class="my-6"><img src="${src}" alt="${alt}"${title}${width}${height} class="rounded-lg max-w-full mx-auto" loading="lazy" /></figure>`;
    }

    case 'youtube': {
      const src = attrs?.src as string | undefined;
      if (!src) return '';

      // Extract video ID from various YouTube URL formats
      let videoId = '';
      const match = src.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      if (match) {
        videoId = match[1];
      }

      if (!videoId) return '';

      const width = attrs?.width || 640;
      const height = attrs?.height || 360;

      return `<div class="my-6 aspect-video rounded-lg overflow-hidden"><iframe src="https://www.youtube.com/embed/${videoId}" width="${width}" height="${height}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full"></iframe></div>`;
    }

    case 'table':
      return `<div class="my-6 overflow-x-auto"><table class="w-full border-collapse border border-slate-200 dark:border-slate-700">${children}</table></div>`;

    case 'tableRow':
      return `<tr>${children}</tr>`;

    case 'tableCell': {
      const colspan = attrs?.colspan ? ` colspan="${attrs.colspan}"` : '';
      const rowspan = attrs?.rowspan ? ` rowspan="${attrs.rowspan}"` : '';
      return `<td class="border border-slate-200 dark:border-slate-700 px-4 py-2"${colspan}${rowspan}>${children}</td>`;
    }

    case 'tableHeader': {
      const colspan = attrs?.colspan ? ` colspan="${attrs.colspan}"` : '';
      const rowspan = attrs?.rowspan ? ` rowspan="${attrs.rowspan}"` : '';
      return `<th class="border border-slate-200 dark:border-slate-700 px-4 py-2 bg-slate-50 dark:bg-slate-800 font-semibold text-left"${colspan}${rowspan}>${children}</th>`;
    }

    default:
      // For unknown node types, just return children
      return children;
  }
}

/**
 * Render Tiptap JSON content to HTML
 * @param json - JSON string or object representing Tiptap document
 * @returns HTML string
 */
export function renderTiptapHtml(json: string | object | null | undefined): string {
  if (!json) return '';

  try {
    const doc: TiptapNode = typeof json === 'string' ? JSON.parse(json) : json;

    if (!doc || typeof doc !== 'object') {
      return '';
    }

    // Handle both full document and content array
    if (doc.type === 'doc') {
      return renderNode(doc);
    }

    // If it's just content array
    if (Array.isArray(doc)) {
      return doc.map(renderNode).join('');
    }

    // Try to render as a single node
    return renderNode(doc);
  } catch (error) {
    console.error('Failed to render Tiptap HTML:', error);
    return '';
  }
}

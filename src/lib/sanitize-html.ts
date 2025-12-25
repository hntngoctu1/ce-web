/**
 * HTML Sanitizer - Pure TypeScript implementation
 * No external dependencies required
 * Removes potentially dangerous HTML while keeping safe content
 */

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'span',
  'div',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'a',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'img',
  'figure',
  'figcaption',
  'iframe',
  'hr',
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel', 'class']),
  img: new Set(['src', 'alt', 'title', 'width', 'height', 'loading', 'class']),
  iframe: new Set(['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'class']),
  code: new Set(['class']),
  pre: new Set(['class']),
  div: new Set(['class', 'style']),
  span: new Set(['class', 'style']),
  p: new Set(['class', 'style']),
  h1: new Set(['class', 'style']),
  h2: new Set(['class', 'style']),
  h3: new Set(['class', 'style']),
  h4: new Set(['class', 'style']),
  h5: new Set(['class', 'style']),
  h6: new Set(['class', 'style']),
  blockquote: new Set(['class']),
  ul: new Set(['class']),
  ol: new Set(['class', 'start']),
  li: new Set(['class']),
  table: new Set(['class']),
  th: new Set(['class', 'colspan', 'rowspan']),
  td: new Set(['class', 'colspan', 'rowspan']),
  figure: new Set(['class']),
};

// Dangerous patterns to remove
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:/gi,
  /on\w+\s*=/gi, // onclick, onerror, etc.
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeAttribute(name: string, value: string): string | null {
  const lowerName = name.toLowerCase();
  const lowerValue = value.toLowerCase();

  // Block dangerous URL schemes
  if (lowerName === 'href' || lowerName === 'src') {
    if (
      lowerValue.startsWith('javascript:') ||
      lowerValue.startsWith('vbscript:') ||
      lowerValue.startsWith('data:text/html')
    ) {
      return null;
    }
  }

  // Block event handlers
  if (lowerName.startsWith('on')) {
    return null;
  }

  // Sanitize style attribute - only allow safe properties
  if (lowerName === 'style') {
    const safeProps = value
      .split(';')
      .map((prop) => prop.trim())
      .filter((prop) => {
        const propName = prop.split(':')[0]?.trim().toLowerCase() || '';
        const safePropNames = [
          'text-align',
          'color',
          'background-color',
          'font-size',
          'font-weight',
          'margin',
          'padding',
        ];
        return safePropNames.some((safe) => propName === safe);
      })
      .join('; ');
    return safeProps || null;
  }

  return value;
}

function parseTag(
  tag: string
): { tagName: string; attributes: Record<string, string>; selfClosing: boolean } | null {
  // Match opening tag
  const match = tag.match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*)?)\s*(\/?)>$/);
  if (!match) return null;

  const tagName = match[1].toLowerCase();
  const attrString = match[2] || '';
  const selfClosing = match[3] === '/' || ['br', 'hr', 'img', 'input'].includes(tagName);

  const attributes: Record<string, string> = {};

  // Parse attributes
  const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let attrMatch;
  while ((attrMatch = attrRegex.exec(attrString)) !== null) {
    const attrName = attrMatch[1].toLowerCase();
    const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
    attributes[attrName] = attrValue;
  }

  return { tagName, attributes, selfClosing };
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - Raw HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return '';

  let result = html;

  // Remove dangerous patterns first
  for (const pattern of DANGEROUS_PATTERNS) {
    result = result.replace(pattern, '');
  }

  // Process tags
  const tagRegex = /<\/?[a-zA-Z][^>]*>/g;

  result = result.replace(tagRegex, (tag) => {
    // Check if it's a closing tag
    if (tag.startsWith('</')) {
      const tagName = tag.slice(2, -1).trim().toLowerCase();
      if (ALLOWED_TAGS.has(tagName)) {
        return `</${tagName}>`;
      }
      return '';
    }

    const parsed = parseTag(tag);
    if (!parsed) return '';

    const { tagName, attributes, selfClosing } = parsed;

    // Check if tag is allowed
    if (!ALLOWED_TAGS.has(tagName)) {
      return '';
    }

    // Filter attributes
    const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || new Set(['class']);
    const sanitizedAttrs: string[] = [];

    for (const [name, value] of Object.entries(attributes)) {
      if (allowedAttrs.has(name) || name === 'class') {
        const sanitizedValue = sanitizeAttribute(name, value);
        if (sanitizedValue !== null) {
          sanitizedAttrs.push(`${name}="${escapeHtml(sanitizedValue)}"`);
        }
      }
    }

    // Special handling for links - add rel="noopener noreferrer" for external links
    if (tagName === 'a' && attributes.target === '_blank') {
      if (!sanitizedAttrs.some((attr) => attr.startsWith('rel='))) {
        sanitizedAttrs.push('rel="noopener noreferrer"');
      }
    }

    // Special handling for iframes - add loading="lazy"
    if (tagName === 'iframe') {
      if (!sanitizedAttrs.some((attr) => attr.startsWith('loading='))) {
        sanitizedAttrs.push('loading="lazy"');
      }
    }

    const attrString = sanitizedAttrs.length > 0 ? ' ' + sanitizedAttrs.join(' ') : '';

    if (selfClosing) {
      return `<${tagName}${attrString} />`;
    }

    return `<${tagName}${attrString}>`;
  });

  return result;
}

/**
 * Strip all HTML tags and return plain text
 * @param html - HTML string
 * @returns Plain text
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

import DOMPurify from 'dompurify';

/**
 * Central HTML sanitizer for every dangerouslySetInnerHTML sink.
 * Strips event handlers, javascript: URLs, and non-allowlisted tags/attrs.
 */
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'em', 'b', 'i', 'u', 's', 'code', 'pre', 'blockquote',
  'ul', 'ol', 'li',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span', 'mark',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel', 'class'];

export const sanitizeHtml = (dirty: string): string =>
  DOMPurify.sanitize(dirty || '', {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Force safe link behavior; javascript:/data: URIs are dropped by DOMPurify
    ADD_ATTR: ['target'],
  });

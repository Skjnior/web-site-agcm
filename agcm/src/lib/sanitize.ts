// lib/sanitize.ts
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// Créer un environnement DOM pour DOMPurify côté serveur
let purifyInstance: ReturnType<typeof DOMPurify> | null = null;

function getPurify() {
  if (typeof window !== 'undefined') {
    // Côté client
    return DOMPurify(window);
  } else {
    // Côté serveur - créer une instance réutilisable
    if (!purifyInstance) {
      const window = new JSDOM('').window;
      purifyInstance = DOMPurify(window as unknown as typeof globalThis);
    }
    return purifyInstance;
  }
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';

  const purify = getPurify();

  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'style', 'width', 'height',
      'target', 'rel',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    // Désactiver les scripts et événements
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

/**
 * Sanitize a URL to prevent XSS and open redirect attacks
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '';

  try {
    const parsed = new URL(url, 'https://example.com');
    // Only allow http, https, mailto, tel
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}


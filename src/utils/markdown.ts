import { marked } from 'marked';
import TurndownService from 'turndown';
// @ts-ignore
import { gfm } from 'turndown-plugin-gfm';

const td = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
});

try {
  td.use(gfm);
} catch {}

td.keep(['u', 'mark']);

export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  try {
    return td.turndown(html);
  } catch {
    return html;
  }
}

export function markdownToHtml(md: string): string {
  if (!md) return '<p><br></p>';
  try {
    return marked.parse(md) as string;
  } catch {
    return `<p>${md}</p>`;
  }
}

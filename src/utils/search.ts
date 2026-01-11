import type { ISearchIndexItem } from '@/services/searchIndexService';
import type { TContentType } from '@/types';

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

/**
 * 搜索匹配：对 title/description/keywords 做简单包含匹配（大小写不敏感）。
 */
export function matchesSearchItem(item: ISearchIndexItem, query: string): boolean {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return true;
  const haystack = `${item.title} ${item.description} ${item.keywords.join(' ')}`.toLowerCase();
  return haystack.includes(normalizedQuery);
}

export function matchesContentType(item: ISearchIndexItem, type: TContentType | 'all'): boolean {
  if (type === 'all') return true;
  return item.type === type;
}

export interface IHighlightPart {
  text: string;
  highlighted: boolean;
}

/**
 * 将文本按 query 拆分成“高亮/非高亮”片段；不使用 HTML 注入，安全渲染。
 */
export function splitHighlightParts(text: string, query: string): IHighlightPart[] {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return [{ text, highlighted: false }];

  const lowerText = text.toLowerCase();
  const parts: IHighlightPart[] = [];

  let cursor = 0;
  while (cursor < text.length) {
    const index = lowerText.indexOf(normalizedQuery, cursor);
    if (index === -1) break;

    if (index > cursor) {
      parts.push({ text: text.slice(cursor, index), highlighted: false });
    }
    parts.push({ text: text.slice(index, index + normalizedQuery.length), highlighted: true });
    cursor = index + normalizedQuery.length;
  }

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), highlighted: false });
  }

  return parts.length > 0 ? parts : [{ text, highlighted: false }];
}

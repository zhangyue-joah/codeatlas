'use client';

import Link from 'next/link';
import type { ISearchIndexItem } from '@/services/searchIndexService';
import { cn } from '@/lib/utils';
import { HighlightedText } from '@/components/search/HighlightedText';
import { useT } from '@/i18n/client';
import { getContentTypeLabel } from '@/i18n/labels';

interface ISearchResultLinkProps {
  item: ISearchIndexItem;
  query: string;
  onSelect?: () => void;
}

/**
 * 根据内容类型返回对应的颜色样式
 */
function getTypeColorClass(type: string): string {
  switch (type) {
    case 'tools':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'compare':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'tutorials':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'templates':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function SearchResultLink({ item, query, onSelect }: ISearchResultLinkProps) {
  const { language } = useT();
  return (
    <Link
      href={item.href}
      onClick={onSelect}
      className={cn(
        'group block rounded-xl border border-transparent bg-background px-4 py-3 transition-all',
        'hover:border-border hover:bg-accent hover:shadow-sm'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground group-hover:text-primary">
            <HighlightedText text={item.title} query={query} />
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground">
            <HighlightedText text={item.description} query={query} />
          </div>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-md px-2 py-1 text-xs font-medium',
            getTypeColorClass(item.type)
          )}
        >
          {getContentTypeLabel(language, item.type)}
        </span>
      </div>
    </Link>
  );
}

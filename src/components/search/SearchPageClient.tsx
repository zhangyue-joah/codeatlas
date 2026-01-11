'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchIndex, type TSearchContentType } from '@/hooks/useSearchIndex';
import { buildSearchHref } from '@/utils/query';
import { SearchResultLink } from '@/components/search/SearchResultLink';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/client';
import { getContentTypeEntries } from '@/i18n/labels';

interface ISearchPageClientProps {
  initialQuery: string;
  initialType: TSearchContentType;
}

/**
 * 搜索结果页（客户端）：复用同一索引，本地过滤以保证输入即时响应。
 */
export function SearchPageClient({ initialQuery, initialType }: ISearchPageClientProps) {
  const { t, language } = useT();
  const router = useRouter();
  const { query, setQuery, type, setType, loading, filteredItems, ensureIndexLoaded } = useSearchIndex({
    initialQuery,
    initialType,
  });

  useEffect(() => {
    void ensureIndexLoaded();
  }, [ensureIndexLoaded]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      router.replace(buildSearchHref('/search', { q: query || undefined, type: type === 'all' ? undefined : type }));
    }, 250);
    return () => window.clearTimeout(id);
  }, [query, router, type]);

  const visibleItems = useMemo(() => filteredItems.slice(0, 100), [filteredItems]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <label htmlFor="site-search-input" className="sr-only">
              {t('search.input.placeholder')}
            </label>
            <input
              id="site-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.input.placeholder')}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <TypeChip label={t('common.all')} active={type === 'all'} onClick={() => setType('all')} />
          {getContentTypeEntries(language).map(([key, label]) => (
            <TypeChip key={key} label={label} active={type === key} onClick={() => setType(key as TSearchContentType)} />
          ))}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          {loading
            ? t('search.loading')
            : t('search.count', { count: filteredItems.length, visible: visibleItems.length })}
        </div>
      </div>

      <div className="space-y-2">
        {!loading && visibleItems.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
            {t('search.emptyHint')}
          </div>
        )}
        {visibleItems.map((item) => (
          <div key={`${item.type}:${item.slug}`} className={cn('rounded-2xl border border-border bg-card shadow-card')}>
            <SearchResultLink item={item} query={query} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {label}
    </button>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ISearchIndexItem } from '@/services/searchIndexService';
import type { TContentType } from '@/types';
import { matchesContentType, matchesSearchItem } from '@/utils/search';

interface ISearchIndexResponse {
  generatedAt: string;
  items: ISearchIndexItem[];
}

export type TSearchContentType = TContentType | 'all';

interface IUseSearchIndexOptions {
  initialQuery?: string;
  initialType?: TSearchContentType;
}

/**
 * 获取并缓存搜索索引，在浏览器侧本地过滤以实现即时响应。
 */
export function useSearchIndex(options: IUseSearchIndexOptions = {}) {
  const [query, setQuery] = useState(options.initialQuery ?? '');
  const [type, setType] = useState<TSearchContentType>(options.initialType ?? 'all');
  const [items, setItems] = useState<ISearchIndexItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items
      .filter((item) => matchesContentType(item, type))
      .filter((item) => matchesSearchItem(item, query))
      .slice(0, 50);
  }, [items, query, type]);

  const ensureIndexLoaded = useCallback(async () => {
    if (items || loading) return;
    setLoading(true);
    try {
      const response = await fetch('/api/search-index');
      const data = (await response.json()) as ISearchIndexResponse;
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, [items, loading]);

  const reset = useCallback(() => {
    setQuery('');
    setType('all');
  }, []);

  return {
    query,
    setQuery,
    type,
    setType,
    items,
    loading,
    filteredItems,
    ensureIndexLoaded,
    reset,
  };
}

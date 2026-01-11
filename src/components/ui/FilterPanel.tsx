import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { getRequestLanguage, tServer } from '@/i18n/server';

interface IFilterPanelProps {
  /** 当前已选筛选项数量（用于移动端折叠摘要）。 */
  activeCount: number;
  /** 当前结果数量（用于移动端折叠摘要与桌面端提示）。 */
  resultCount: number;
  children: ReactNode;
  className?: string;
}

/**
 * 列表页筛选面板：桌面端常显；移动端可折叠，避免筛选项把内容区“顶下去”。
 */
export function FilterPanel({ activeCount, resultCount, children, className }: IFilterPanelProps) {
  const language = getRequestLanguage();
  const isZh = language !== 'en';
  const filtersLabel = isZh ? '筛选' : 'Filters';
  const selectedLabel = isZh ? `已选 ${activeCount}` : `Selected ${activeCount}`;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Desktop */}
      <div className="hidden sm:block">
        <div className="rounded-2xl bg-muted/10 p-4 ring-1 ring-border/35">
          <div className="space-y-4">{children}</div>
          <div className="mt-4 text-sm text-muted-foreground">{tServer('common.results', { count: resultCount })}</div>
        </div>
      </div>

      {/* Mobile */}
      <details
        className="rounded-2xl bg-muted/10 p-4 ring-1 ring-border/35 sm:hidden"
        open={activeCount > 0}
      >
        <summary className="flex cursor-pointer items-center justify-between gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <span className="text-sm font-semibold text-foreground">{filtersLabel}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {activeCount > 0 && <span>{selectedLabel}</span>}
            <span aria-hidden="true">·</span>
            <span>{tServer('common.results', { count: resultCount })}</span>
          </div>
        </summary>

        <div className="mt-4 space-y-3">{children}</div>
      </details>
    </div>
  );
}

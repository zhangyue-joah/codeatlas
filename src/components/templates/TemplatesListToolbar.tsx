'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buildSearchHref } from '@/utils/query';
import { PillMultiSelect } from '@/components/ui/PillMultiSelect';

export type TTemplatesSelectOption = { value: string; label: string };

interface ITemplatesListToolbarProps {
  language: 'zh' | 'en';
  tools: string[];
  type?: string;
  query: string;
  typeOptions: TTemplatesSelectOption[];
  toolOptions: TTemplatesSelectOption[];
  resultCount: number;
  labels: {
    tools: string;
    type: string;
    queryPlaceholder: string;
    all: string;
    clear: string;
    reset: string;
  };
}

export function TemplatesListToolbar({
  language,
  tools,
  type,
  query,
  typeOptions,
  toolOptions,
  resultCount,
  labels,
}: ITemplatesListToolbarProps) {
  const router = useRouter();
  const isZh = language !== 'en';
  const resultsLabel = isZh ? `${resultCount} 个结果` : `${resultCount} ${resultCount === 1 ? 'result' : 'results'}`;
  const activeCount = (tools.length > 0 ? 1 : 0) + (type ? 1 : 0) + (query.trim() ? 1 : 0);

  const [draftQuery, setDraftQuery] = useState(query);

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  const push = (next: { tools?: string[]; type?: string; q?: string }, replace = false) => {
    const href = buildSearchHref('/templates', {
      tools: next.tools ?? tools,
      type: next.type ?? type,
      q: (next.q ?? query).trim() || undefined,
    });
    if (replace) router.replace(href);
    else router.push(href);
  };

  const toolbarMetaText = 'inline-flex h-9 items-center px-1 text-xs font-medium text-muted-foreground select-none';

  useEffect(() => {
    const normalized = draftQuery.trim();
    const current = query.trim();
    if (normalized === current) return;
    const id = window.setTimeout(() => {
      router.replace(
        buildSearchHref('/templates', {
          tools,
          type,
          q: normalized || undefined,
        })
      );
    }, 250);
    return () => window.clearTimeout(id);
  }, [draftQuery, query, router, tools, type]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <SearchIcon />
            </span>
            <input
              value={draftQuery}
              onChange={(e) => setDraftQuery(e.target.value)}
              placeholder={labels.queryPlaceholder}
              aria-label={labels.queryPlaceholder}
              autoFocus
              className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            {draftQuery.trim() ? (
              <button
                type="button"
                onClick={() => setDraftQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label={isZh ? '清空搜索' : 'Clear search'}
              >
                <ClearIcon />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => push({ tools: [], type: undefined, q: '' })}
            disabled={activeCount === 0}
            className={cn(
              'inline-flex h-11 items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              activeCount > 0
                ? 'text-foreground hover:bg-accent hover:text-accent-foreground'
                : 'cursor-not-allowed text-muted-foreground opacity-60'
            )}
          >
            {labels.reset}
          </button>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{labels.type}</span>
              <div className="flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto pb-1">
                <TypeChip
                  label={labels.all}
                  active={!type}
                  onClick={() => push({ tools, type: undefined, q: draftQuery })}
                />
                {typeOptions.map((opt) => (
                  <TypeChip
                    key={opt.value}
                    label={opt.label}
                    active={type === opt.value}
                    onClick={() => push({ tools, type: opt.value, q: draftQuery })}
                  />
                ))}
              </div>
            </div>

            <PillMultiSelect
              label={labels.tools}
              values={tools}
              options={toolOptions}
              emptyLabel={labels.all}
              clearLabel={labels.clear}
              onChange={(values) => push({ tools: values, type, q: draftQuery })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={toolbarMetaText}>{resultsLabel}</span>
            {activeCount > 0 ? <span className={toolbarMetaText}>{isZh ? `已选 ${activeCount}` : `Selected ${activeCount}`}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {label}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

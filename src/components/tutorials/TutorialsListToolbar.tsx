'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buildSearchHref } from '@/utils/query';
import { PillMultiSelect } from '@/components/ui/PillMultiSelect';

export type TTutorialsSelectOption = { value: string; label: string };

interface ITutorialsListToolbarProps {
  language: 'zh' | 'en';
  tools: string[];
  task?: string;
  type?: string;
  sort?: string;
  toolOptions: TTutorialsSelectOption[];
  taskOptions: TTutorialsSelectOption[];
  typeOptions: TTutorialsSelectOption[];
  sortOptions: TTutorialsSelectOption[];
  sortDefaultLabel: string;
  resultCount: number;
  labels: {
    tools: string;
    task: string;
    type: string;
    sort: string;
    all: string;
    clear: string;
    reset: string;
  };
}

export function TutorialsListToolbar({
  language,
  tools,
  task,
  type,
  sort,
  toolOptions,
  taskOptions,
  typeOptions,
  sortOptions,
  sortDefaultLabel,
  resultCount,
  labels,
}: ITutorialsListToolbarProps) {
  const router = useRouter();
  const isZh = language !== 'en';
  const resultsLabel = isZh ? `${resultCount} 个结果` : `${resultCount} ${resultCount === 1 ? 'result' : 'results'}`;
  const activeCount = (tools.length > 0 ? 1 : 0) + (task ? 1 : 0) + (type ? 1 : 0) + (sort && sort !== 'latest' ? 1 : 0);

  const push = (next: { tools?: string[]; task?: string; type?: string; sort?: string }) => {
    router.push(buildSearchHref('/tutorials', next));
  };

  const toolbarMetaText = 'inline-flex h-9 items-center px-1 text-xs font-medium text-muted-foreground select-none';

  return (
    <div className="rounded-2xl bg-muted/10 p-4 ring-1 ring-border/35">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
          <PillMultiSelect
            label={labels.tools}
            values={tools}
            options={toolOptions}
            emptyLabel={labels.all}
            clearLabel={labels.clear}
            onChange={(values) => push({ tools: values, task, type, sort: sort && sort !== 'latest' ? sort : undefined })}
          />
          <PillMultiSelect
            label={labels.task}
            values={task ? [task] : []}
            options={taskOptions}
            emptyLabel={labels.all}
            clearLabel={labels.clear}
            maxSelected={1}
            onChange={(values) => push({ tools, task: values[0], type, sort: sort && sort !== 'latest' ? sort : undefined })}
          />
          <PillMultiSelect
            label={labels.type}
            values={type ? [type] : []}
            options={typeOptions}
            emptyLabel={labels.all}
            clearLabel={labels.clear}
            maxSelected={1}
            onChange={(values) => push({ tools, task, type: values[0], sort: sort && sort !== 'latest' ? sort : undefined })}
          />
          <PillMultiSelect
            label={labels.sort}
            values={sort && sort !== 'latest' ? [sort] : []}
            options={sortOptions}
            emptyLabel={sortDefaultLabel}
            clearLabel={labels.clear}
            maxSelected={1}
            onChange={(values) => push({ tools, task, type, sort: values[0] && values[0] !== 'latest' ? values[0] : undefined })}
          />

          <span className={toolbarMetaText}>{resultsLabel}</span>
          {activeCount > 0 ? <span className={toolbarMetaText}>{isZh ? `已选 ${activeCount}` : `Selected ${activeCount}`}</span> : null}

          <button
            type="button"
            onClick={() => push({})}
            disabled={activeCount === 0}
            className={cn(
              'inline-flex h-9 items-center justify-center rounded-full border border-input bg-background px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              activeCount > 0
                ? 'text-foreground hover:bg-accent hover:text-accent-foreground'
                : 'cursor-not-allowed text-muted-foreground opacity-60'
            )}
          >
            {labels.reset}
          </button>
        </div>
      </div>
    </div>
  );
}

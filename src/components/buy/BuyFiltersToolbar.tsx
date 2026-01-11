'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buildSearchHref } from '@/utils/query';
import { PillMultiSelect } from '@/components/ui/PillMultiSelect';
import type { TLanguage } from '@/types';

export type TBuySelectOption = { value: string; label: string };

export function BuyFiltersToolbar({
  language,
  pricing,
  procurement,
  compliance,
  pricingOptions,
  procurementOptions,
  complianceOptions,
  totalCount,
  resultCount,
  labels,
}: {
  language: TLanguage;
  pricing: string[];
  procurement: string[];
  compliance: string[];
  pricingOptions: TBuySelectOption[];
  procurementOptions: TBuySelectOption[];
  complianceOptions: TBuySelectOption[];
  totalCount: number;
  resultCount: number;
  labels: {
    pricing: string;
    procurement: string;
    compliance: string;
    all: string;
    clear: string;
    reset: string;
  };
}) {
  const router = useRouter();
  const isZh = language !== 'en';
  const resultsLabel =
    totalCount > resultCount
      ? isZh
        ? `${resultCount} / ${totalCount} 个结果`
        : `${resultCount}/${totalCount} ${totalCount === 1 ? 'result' : 'results'}`
      : isZh
        ? `${resultCount} 个结果`
        : `${resultCount} ${resultCount === 1 ? 'result' : 'results'}`;
  const activeCount = (pricing.length > 0 ? 1 : 0) + (procurement.length > 0 ? 1 : 0) + (compliance.length > 0 ? 1 : 0);
  const metaTextClassName = 'inline-flex h-9 items-center px-1 text-xs font-medium text-muted-foreground select-none';

  const push = (
    next: Partial<{
      pricing: string[];
      procurement: string[];
      compliance: string[];
    }>
  ) => {
    router.push(
      buildSearchHref('/buy', {
        pricing: next.pricing ?? pricing,
        procurement: next.procurement ?? procurement,
        compliance: next.compliance ?? compliance,
      })
    );
  };

  return (
    <div className="rounded-2xl bg-muted/10 p-4 ring-1 ring-border/35">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
          <PillMultiSelect
            label={labels.pricing}
            values={pricing}
            options={pricingOptions}
            emptyLabel={labels.all}
            clearLabel={labels.clear}
            onChange={(values) => push({ pricing: values })}
          />
          <PillMultiSelect
            label={labels.procurement}
            values={procurement}
            options={procurementOptions}
            emptyLabel={labels.all}
            clearLabel={labels.clear}
            onChange={(values) => push({ procurement: values })}
          />
          <PillMultiSelect
            label={labels.compliance}
            values={compliance}
            options={complianceOptions}
            emptyLabel={labels.all}
            clearLabel={labels.clear}
            onChange={(values) => push({ compliance: values })}
          />

          <span className={metaTextClassName}>{resultsLabel}</span>
          {activeCount > 0 ? <span className={metaTextClassName}>{isZh ? `已选 ${activeCount}` : `Selected ${activeCount}`}</span> : null}

          <button
            type="button"
            onClick={() => push({ pricing: [], procurement: [], compliance: [] })}
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


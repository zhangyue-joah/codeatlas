'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buildSearchHref } from '@/utils/query';
import { PillMultiSelect } from '@/components/ui/PillMultiSelect';
import { Badge } from '@/components/ui/Badge';
import type { IBuyChannel, TBuyAudience, TBuyChannelType, TBuyRisk } from '@/types';

export type TBuySelectOption = { value: string; label: string };

interface IBuyChannelsListViewProps {
  language: 'zh' | 'en';
  type?: TBuyChannelType;
  risk?: TBuyRisk;
  audience?: TBuyAudience;
  preserveParams?: Record<string, string | string[] | undefined>;
  typeOptions: TBuySelectOption[];
  riskOptions: TBuySelectOption[];
  audienceOptions: TBuySelectOption[];
  items: IBuyChannel[];
}

export function BuyChannelsListView({
  language,
  type,
  risk,
  audience,
  preserveParams,
  typeOptions,
  riskOptions,
  audienceOptions,
  items,
}: IBuyChannelsListViewProps) {
  const router = useRouter();
  const isZh = language !== 'en';

  const activeCount = (type ? 1 : 0) + (risk ? 1 : 0) + (audience ? 1 : 0);
  const resultsLabel = isZh ? `${items.length} 个结果` : `${items.length} ${items.length === 1 ? 'result' : 'results'}`;
  const metaTextClassName = 'inline-flex h-9 items-center px-1 text-xs font-medium text-muted-foreground select-none';

  const push = (next: Partial<{ type: TBuyChannelType; risk: TBuyRisk; audience: TBuyAudience }>) => {
    router.push(
      buildSearchHref('/buy', {
        ...(preserveParams ?? {}),
        type: next.type ?? type,
        risk: next.risk ?? risk,
        audience: next.audience ?? audience,
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-muted/10 p-4 ring-1 ring-border/35">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
            <PillMultiSelect
              label={isZh ? '渠道' : 'Channel'}
              values={type ? [type] : []}
              options={typeOptions}
              emptyLabel={isZh ? '全部' : 'Any'}
              clearLabel={isZh ? '清空' : 'Clear'}
              maxSelected={1}
              onChange={(values) => push({ type: values[0] as TBuyChannelType | undefined, risk, audience })}
            />
            <PillMultiSelect
              label={isZh ? '风险' : 'Risk'}
              values={risk ? [risk] : []}
              options={riskOptions}
              emptyLabel={isZh ? '不限' : 'Any'}
              clearLabel={isZh ? '清空' : 'Clear'}
              maxSelected={1}
              onChange={(values) => push({ type, risk: values[0] as TBuyRisk | undefined, audience })}
            />
            <PillMultiSelect
              label={isZh ? '对象' : 'Audience'}
              values={audience ? [audience] : []}
              options={audienceOptions}
              emptyLabel={isZh ? '不限' : 'Any'}
              clearLabel={isZh ? '清空' : 'Clear'}
              maxSelected={1}
              onChange={(values) => push({ type, risk, audience: values[0] as TBuyAudience | undefined })}
            />

            <span className={metaTextClassName}>{resultsLabel}</span>
            {activeCount > 0 ? <span className={metaTextClassName}>{isZh ? `已选 ${activeCount}` : `Selected ${activeCount}`}</span> : null}

            <button
              type="button"
              onClick={() =>
                router.push(
                  buildSearchHref('/buy', {
                    ...(preserveParams ?? {}),
                    type: undefined,
                    risk: undefined,
                    audience: undefined,
                  })
                )
              }
              disabled={activeCount === 0}
              className={cn(
                'inline-flex h-9 items-center justify-center rounded-full border border-input bg-background px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                activeCount > 0
                  ? 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  : 'cursor-not-allowed text-muted-foreground opacity-60'
              )}
            >
              {isZh ? '重置' : 'Reset'}
            </button>
          </div>
        </div>
      </div>

      <ul role="list" className="space-y-4">
        {items.map((item) => (
          <li key={item.id}>
            <BuyChannelCard item={item} language={language} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function BuyChannelCard({ item, language }: { item: IBuyChannel; language: 'zh' | 'en' }) {
  const isZh = language !== 'en';
  const riskLabel = formatRisk(item.risk, language);

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-card-foreground">{item.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          {item.href ? (
            <a
              className="mt-3 inline-flex text-sm text-primary underline underline-offset-4"
              href={item.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              {isZh ? '打开入口 →' : 'Open →'}
            </a>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <Badge className={item.risk === 'high' ? 'bg-destructive text-destructive-foreground' : 'bg-muted'}>{riskLabel}</Badge>
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground">{isZh ? '价格' : 'Price'}</dt>
          <dd className="text-foreground text-right">{item.price}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground">{isZh ? '效果' : 'Outcome'}</dt>
          <dd className="text-foreground text-right">{item.outcome}</dd>
        </div>
        {item.notes ? (
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground">{isZh ? '提示' : 'Note'}</dt>
            <dd className="text-foreground text-right">{item.notes}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function formatRisk(risk: TBuyRisk, language: 'zh' | 'en') {
  if (language === 'en') {
    if (risk === 'low') return 'Low risk';
    if (risk === 'medium') return 'Medium risk';
    return 'High risk';
  }
  if (risk === 'low') return '低风险';
  if (risk === 'medium') return '中风险';
  return '高风险';
}

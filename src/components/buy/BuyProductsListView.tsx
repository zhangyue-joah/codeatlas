'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, toTrimmedString } from '@/lib/utils';
import { getToolDisplayTitle } from '@/lib/toolDisplay';
import { buildSearchHref } from '@/utils/query';
import { PillMultiSelect } from '@/components/ui/PillMultiSelect';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { IToolFrontmatter, TLanguage } from '@/types';
import { getPricingModelLabel } from '@/i18n/labels';

export type TBuySelectOption = { value: string; label: string };

export type TBuyProcurementPath = 'official' | 'authorized' | 'enterprise';
export type TBuyCompliance = 'invoice' | 'contract';

export type TBuyProductsListItem = {
  slug: string;
  tool: IToolFrontmatter;
};

interface IBuyProductsListViewProps {
  language: TLanguage;
  pricing: string[];
  procurement: string[];
  compliance: string[];
  preserveParams?: Record<string, string | string[] | undefined>;
  pricingOptions: TBuySelectOption[];
  procurementOptions: TBuySelectOption[];
  complianceOptions: TBuySelectOption[];
  totalCount: number;
  items: TBuyProductsListItem[];
  emptyTitle: string;
  emptyDescription: string;
  labels: {
    pricing: string;
    procurement: string;
    compliance: string;
    all: string;
    clear: string;
    reset: string;
  };
}

export function BuyProductsListView({
  language,
  pricing,
  procurement,
  compliance,
  preserveParams,
  pricingOptions,
  procurementOptions,
  complianceOptions,
  totalCount,
  items,
  emptyTitle,
  emptyDescription,
  labels,
}: IBuyProductsListViewProps) {
  const router = useRouter();
  const isZh = language !== 'en';
  const resultsLabel =
    totalCount > items.length
      ? isZh
        ? `${items.length} / ${totalCount} 个结果`
        : `${items.length}/${totalCount} ${totalCount === 1 ? 'result' : 'results'}`
      : isZh
        ? `${items.length} 个结果`
        : `${items.length} ${items.length === 1 ? 'result' : 'results'}`;
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
        ...(preserveParams ?? {}),
        pricing: next.pricing ?? pricing,
        procurement: next.procurement ?? procurement,
        compliance: next.compliance ?? compliance,
      })
    );
  };

  return (
    <div className="space-y-1.5">
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

      {items.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <ul role="list" className="space-y-4">
          {items.map((item) => (
            <li key={item.slug}>
              <BuyProductCard slug={item.slug} tool={item.tool} language={language} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BuyProductCard({ slug, tool, language }: { slug: string; tool: IToolFrontmatter; language: TLanguage }) {
  const isZh = language !== 'en';
  const pricingModelLabel = getPricingModelLabel(language, tool.pricing.model);
  const startingPriceLabel = formatStartingPrice(tool, language);
  const officialUrl = tool.purchase?.officialUrl ?? tool.website;

  const procurementCards = [
    {
      id: 'official',
      title: isZh ? '官网/定价' : 'Official pricing',
      description: isZh ? '条款最清晰、信息最可追溯，作为基准最稳妥。' : 'Best baseline: clear terms and traceable source.',
      outcome: isZh ? '风险最低，续费/售后更稳定' : 'Lowest risk; most reliable renewals & support',
      href: officialUrl,
    },
    ...(tool.purchase?.authorizedUrl
      ? [
          {
            id: 'authorized',
            title: isZh ? '授权渠道' : 'Authorized reseller',
            description: isZh ? '适合开票/本地付款/采购流程，但需要核验资质。' : 'Good for invoicing and procurement; verify authorization.',
            outcome: isZh ? '采购更顺，但关注售后范围' : 'Smoother procurement; confirm support scope',
            href: tool.purchase.authorizedUrl,
          },
        ]
      : []),
    ...(tool.pricing.hasEnterprise || tool.pricing.supportsContract
      ? [
          {
            id: 'enterprise',
            title: isZh ? '企业采购（合同）' : 'Enterprise sales (contract)',
            description: isZh ? '适合 SLA / 审计 / 合规要求，通常走合同与年度。' : 'Best for SLA, audit, and compliance requirements.',
            outcome: isZh ? '治理更可控，条款更可对齐' : 'More governance control and aligned terms',
            href: officialUrl,
          },
        ]
      : []),
  ];

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight text-card-foreground sm:text-lg">
            <Link href={`/tools/${slug}#pricing`} className="hover:underline">
              {getToolDisplayTitle(tool, language)}
            </Link>
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">{tool.description}</p>
        </div>
        <div className="shrink-0">
          <Badge>{pricingModelLabel}</Badge>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className="bg-muted">
          {startingPriceLabel ? startingPriceLabel : isZh ? '价格以官方为准' : 'Pricing: refer to official'}
          {tool.pricing.free ? (isZh ? ' · 免费层' : ' · Free tier') : ''}
        </Badge>
        <Badge className="bg-muted">{isZh ? `发票：${tool.pricing.supportsInvoice ? '支持' : '不支持'}` : `Invoice: ${tool.pricing.supportsInvoice ? 'Yes' : 'No'}`}</Badge>
        <Badge className="bg-muted">{isZh ? `合同：${tool.pricing.supportsContract ? '支持' : '不支持'}` : `Contract: ${tool.pricing.supportsContract ? 'Yes' : 'No'}`}</Badge>
      </div>

      <div className="mt-5">
        <div className="flex flex-nowrap snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
          {procurementCards.map((item) => (
            <a
              key={item.id}
              className="w-[280px] shrink-0 snap-start rounded-2xl border border-border/70 bg-background p-4 shadow-card transition-shadow hover:shadow-card-hover sm:w-[320px]"
              href={item.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{item.title}</div>
                  <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{isZh ? '打开' : 'Open'}</span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <div>{isZh ? '价格：' : 'Price: '}{startingPriceLabel ? startingPriceLabel : isZh ? '以官网为准' : 'Refer to official'}</div>
                <div className="mt-1">{isZh ? '效果：' : 'Outcome: '}{item.outcome}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatBillingCycle(cycle: IToolFrontmatter['pricing']['billingCycle'] | undefined, language: TLanguage): string | null {
  if (!cycle) return null;
  if (language === 'en') {
    if (cycle === 'monthly') return 'mo';
    if (cycle === 'yearly') return 'yr';
    return 'usage';
  }
  if (cycle === 'monthly') return '月';
  if (cycle === 'yearly') return '年';
  return '用量';
}

function formatStartingPrice(tool: IToolFrontmatter, language: TLanguage): string | null {
  const price = toTrimmedString(tool.pricing.startingPrice);
  const currency = toTrimmedString(tool.pricing.currency);
  if (!price || !currency) return null;
  const cycle = formatBillingCycle(tool.pricing.billingCycle, language);
  if (cycle) {
    if (language === 'en') return `from ${price} ${currency}/${cycle}`;
    return `起步 ${price} ${currency}/${cycle}`;
  }
  if (language === 'en') return `from ${price} ${currency}`;
  return `起步 ${price} ${currency}`;
}

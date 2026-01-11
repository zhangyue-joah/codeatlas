import type { IToolFrontmatter, TLanguage } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { SectionCard } from '@/components/ui/SectionCard';
import { cn, formatDate } from '@/lib/utils';
import { t } from '@/i18n/messages';
import { getPricingModelLabel } from '@/i18n/labels';
import { formatToolStartingPrice } from '@/lib/toolPricing';

interface IToolPurchaseCardProps {
  tool: IToolFrontmatter;
  language: TLanguage;
  id?: string;
  /** 是否使用可折叠模式（适合工具页右侧固定“用/买”区块） */
  collapsible?: boolean;
  /** 折叠模式下默认是否展开 */
  defaultOpen?: boolean;
}

/**
 * 工具购买卡片：展示官方/授权入口、价格模式与合规声明。
 */
export function ToolPurchaseCard({ tool, language, id, collapsible, defaultOpen }: IToolPurchaseCardProps) {
  const pricingModelLabel = getPricingModelLabel(language, tool.pricing.model);
  const startingPriceLabel = formatToolStartingPrice(tool, language);
  const freeTierLabel = tool.pricing.free ? (language === 'en' ? 'Free tier' : '免费层') : null;

  if (collapsible) {
    return (
      <details id={id} open={defaultOpen} className="group rounded-xl border border-border bg-card">
        <summary className="cursor-pointer list-none px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <ToolPurchaseSummary
            language={language}
            pricingModelLabel={pricingModelLabel}
            startingPriceLabel={startingPriceLabel}
            freeTierLabel={freeTierLabel}
          />
        </summary>
        <div className="px-5 pb-5">
          <ToolPurchaseContent tool={tool} language={language} />
        </div>
      </details>
    );
  }

  return (
    <SectionCard
      id={id}
      title={t(language, 'tool.purchase.title')}
      description={t(language, 'tool.purchase.desc')}
      headerRight={<Badge>{pricingModelLabel}</Badge>}
    >
      <ToolPurchaseContent tool={tool} language={language} />
    </SectionCard>
  );
}

function ToolPurchaseSummary({
  language,
  pricingModelLabel,
  startingPriceLabel,
  freeTierLabel,
}: {
  language: TLanguage;
  pricingModelLabel: string;
  startingPriceLabel: string | null;
  freeTierLabel: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-semibold text-card-foreground">{t(language, 'tool.purchase.title')}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {startingPriceLabel ? `${startingPriceLabel}${freeTierLabel ? ` · ${freeTierLabel}` : ''}` : t(language, 'tool.purchase.desc')}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge>{pricingModelLabel}</Badge>
        <svg
          className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

function ToolPurchaseContent({ tool, language }: { tool: IToolFrontmatter; language: TLanguage }) {
  return (
    <div>
      <ToolPurchaseMeta tool={tool} language={language} />
      <ToolPurchaseEntitlements tool={tool} language={language} />
      <ToolPurchaseCompliance tool={tool} language={language} />
      <ToolPurchaseSources sources={tool.purchase?.sources} language={language} />
      <ToolPurchaseNotes notes={tool.purchase?.notes} />
      <AffiliateDisclosure disclosure={tool.affiliateDisclosure} language={language} />
    </div>
  );
}

function ToolPurchaseMeta({ tool, language }: { tool: IToolFrontmatter; language: TLanguage }) {
  const officialUrl = tool.purchase?.officialUrl ?? tool.website;
  const affiliateUrl = tool.affiliateLink;
  const purchaseUpdatedAt = tool.purchase?.updatedAt ?? tool.updatedAt;
  const startingPriceLabel = formatToolStartingPrice(tool, language);
  const links: { id: string; label: string; href: string; tone: 'primary' | 'secondary' }[] = [
    { id: 'official', label: t(language, 'tool.purchase.link.official'), href: officialUrl, tone: 'primary' },
    ...(affiliateUrl
      ? [{ id: 'affiliate', label: t(language, 'tool.purchase.link.affiliate'), href: affiliateUrl, tone: 'secondary' as const }]
      : []),
    ...(tool.purchase?.authorizedUrl
      ? [
          {
            id: 'authorized',
            label: t(language, 'tool.purchase.link.authorized'),
            href: tool.purchase.authorizedUrl,
            tone: 'secondary' as const,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(
              'inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              link.tone === 'primary'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {link.label} ↗
          </a>
        ))}
      </div>

      <dl className="grid gap-3 text-sm">
        {startingPriceLabel ? <ToolPurchaseFactRow label={t(language, 'tool.purchase.startingPrice')} value={startingPriceLabel} /> : null}
        <ToolPurchaseFactRow label={t(language, 'tool.purchase.pricingModel')} value={getPricingModelLabel(language, tool.pricing.model)} />
        <ToolPurchaseFactRow label={t(language, 'tool.purchase.free')} value={tool.pricing.free ? t(language, 'common.yes') : t(language, 'common.no')} />
        <ToolPurchaseFactRow label={t(language, 'tool.purchase.updatedAt')} value={formatDate(purchaseUpdatedAt, language)} />
      </dl>
    </div>
  );
}

function ToolPurchaseEntitlements({ tool, language }: { tool: IToolFrontmatter; language: TLanguage }) {
  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-card-foreground">{t(language, 'tool.purchase.entitlements')}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <FeaturePill label={t(language, 'tool.purchase.entitlement.education')} enabled={tool.pricing.hasEducation} language={language} />
        <FeaturePill label={t(language, 'tool.purchase.entitlement.team')} enabled={tool.pricing.hasTeam} language={language} />
        <FeaturePill label={t(language, 'tool.purchase.entitlement.enterprise')} enabled={tool.pricing.hasEnterprise} language={language} />
      </div>
    </div>
  );
}

function ToolPurchaseCompliance({ tool, language }: { tool: IToolFrontmatter; language: TLanguage }) {
  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-card-foreground">{t(language, 'tool.purchase.compliance')}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <FeaturePill label={t(language, 'tool.purchase.compliance.invoice')} enabled={tool.pricing.supportsInvoice} language={language} />
        <FeaturePill label={t(language, 'tool.purchase.compliance.contract')} enabled={tool.pricing.supportsContract} language={language} />
      </div>
    </div>
  );
}

function ToolPurchaseFactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function ToolPurchaseNotes({ notes }: { notes?: string[] }) {
  if (!notes || notes.length === 0) return null;
  return (
    <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
      {notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}

/**
 * 购买信息“来源”：用于满足 PRD 的“购买信息可追溯、可解释”要求。
 */
function ToolPurchaseSources({ sources, language }: { sources?: { label: string; url: string }[]; language: TLanguage }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-card-foreground">{t(language, 'tool.purchase.sources')}</div>
      <div className="mt-2 flex flex-col gap-2 text-sm">
        {sources.map((source) => (
          <a
            key={source.url}
            className="text-primary underline underline-offset-4"
            href={source.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            {source.label} →
          </a>
        ))}
      </div>
    </div>
  );
}

function AffiliateDisclosure({ disclosure, language }: { disclosure?: string; language: TLanguage }) {
  if (!disclosure) return null;
  return (
    <p className="mt-4 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
      {t(language, 'tool.purchase.affiliateDisclosure', { disclosure })}
    </p>
  );
}

function FeaturePill({ label, enabled, language }: { label: string; enabled: boolean; language: TLanguage }) {
  const separator = language === 'en' ? ': ' : '：';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs',
        enabled
          ? 'border-border bg-secondary text-secondary-foreground'
          : 'border-border bg-muted text-muted-foreground'
      )}
    >
      {label}
      {separator}
      {enabled ? t(language, 'tool.purchase.feature.supported') : t(language, 'tool.purchase.feature.unsupported')}
    </span>
  );
}

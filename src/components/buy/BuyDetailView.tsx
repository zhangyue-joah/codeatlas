import Link from 'next/link';
import Image from 'next/image';
import type { IToolFrontmatter, TLanguage } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { DetailLayout } from '@/components/layout/DetailLayout';
import { SectionCard } from '@/components/ui/SectionCard';
import { BackLink } from '@/components/ui/BackLink';
import { PageHeader } from '@/components/ui/PageHeader';
import { OnThisPageNav } from '@/components/ui/OnThisPageNav';
import { formatDate } from '@/lib/utils';
import { getToolDisplayTitle } from '@/lib/toolDisplay';
import { formatToolStartingPrice } from '@/lib/toolPricing';
import { getRequestLanguage } from '@/i18n/server';
import { t } from '@/i18n/messages';
import { getPricingModelLabel } from '@/i18n/labels';

interface IBuyDetailViewProps {
  slug: string;
  tool: IToolFrontmatter;
}

export function BuyDetailView({ slug, tool }: IBuyDetailViewProps) {
  const language = getRequestLanguage();
  const isZh = language !== 'en';
  const displayTitle = getToolDisplayTitle(tool, language);

  const onThisPageItems = [
    { href: '#pricing-overview' as const, label: isZh ? '定价概览' : 'Pricing Overview' },
    { href: '#purchase-options' as const, label: isZh ? '购买渠道' : 'Purchase Options' },
    { href: '#compliance' as const, label: isZh ? '合规信息' : 'Compliance' },
    { href: '#how-to-choose' as const, label: isZh ? '如何选择' : 'How to Choose' },
  ];

  return (
    <DetailLayout
      asidePlacement="left"
      asideVariant="narrow"
      main={
        <div className="space-y-8">
          {/* 头部：标题 + 描述 */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/60">
              <Image
                src={tool.logo || '/logos/default.svg'}
                alt=""
                aria-hidden="true"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <PageHeader
                variant="inline"
                title={isZh ? `购买 ${displayTitle}` : `Buy ${displayTitle}`}
                description={tool.description}
                updatedAt={tool.purchase?.updatedAt ?? tool.updatedAt}
              />
            </div>
          </div>

          {/* 定价概览 */}
          <PricingOverviewCard id="pricing-overview" tool={tool} language={language} />

          {/* 购买渠道 */}
          <PurchaseOptionsCard id="purchase-options" tool={tool} language={language} />

          {/* 合规信息 */}
          <ComplianceCard id="compliance" tool={tool} language={language} />

          {/* 如何选择 */}
          <HowToChooseCard id="how-to-choose" tool={tool} language={language} />

          {/* 底部链接 */}
          <div className="flex flex-wrap items-center gap-4 border-t border-border/50 pt-6">
            <Link
              href={`/tools/${slug}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {isZh ? '查看产品详情 →' : 'View product details →'}
            </Link>
            <Link
              href="/buy"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {isZh ? '← 返回购买列表' : '← Back to purchase list'}
            </Link>
          </div>
        </div>
      }
      aside={
        <div className="space-y-6 lg:sticky lg:top-24">
          <BackLink href="/buy" label={isZh ? '返回购买列表' : 'Back to list'} />
          <OnThisPageNav title={isZh ? '本页导航' : 'On this page'} items={onThisPageItems} showTitle={false} />
        </div>
      }
    />
  );
}

/**
 * 定价概览卡片
 */
function PricingOverviewCard({ id, tool, language }: { id?: string; tool: IToolFrontmatter; language: TLanguage }) {
  const isZh = language !== 'en';
  const pricingModelLabel = getPricingModelLabel(language, tool.pricing.model);
  const startingPrice = formatToolStartingPrice(tool, language);

  return (
    <SectionCard
      id={id}
      title={isZh ? '定价概览' : 'Pricing Overview'}
      description={isZh ? '了解该工具的定价模式和费用' : 'Understand the pricing model and costs'}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* 计费模式 */}
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isZh ? '计费模式' : 'Pricing Model'}
          </div>
          <div className="mt-2 text-lg font-semibold text-foreground">{pricingModelLabel}</div>
        </div>

        {/* 起步价 */}
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isZh ? '起步价' : 'Starting Price'}
          </div>
          <div className="mt-2 text-lg font-semibold text-foreground">
            {startingPrice || (isZh ? '以官网为准' : 'Refer to official')}
          </div>
        </div>

        {/* 免费层 */}
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isZh ? '免费层' : 'Free Tier'}
          </div>
          <div className="mt-2">
            {tool.pricing.free ? (
              <Badge variant="success">{isZh ? '有免费层' : 'Available'}</Badge>
            ) : (
              <span className="text-lg font-semibold text-foreground">{isZh ? '无' : 'None'}</span>
            )}
          </div>
        </div>
      </div>

      {/* 企业版信息 */}
      {tool.pricing.hasEnterprise && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Badge variant="primary">{isZh ? '企业版' : 'Enterprise'}</Badge>
            <span className="text-sm text-foreground">
              {isZh ? '支持企业采购，可定制方案' : 'Enterprise plans available with custom options'}
            </span>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/**
 * 购买渠道卡片
 */
function PurchaseOptionsCard({ id, tool, language }: { id?: string; tool: IToolFrontmatter; language: TLanguage }) {
  const isZh = language !== 'en';
  const officialUrl = tool.purchase?.officialUrl ?? tool.website;
  const authorizedUrl = tool.purchase?.authorizedUrl;
  const affiliateUrl = tool.affiliateLink;

  const channels = [
    {
      id: 'official',
      title: isZh ? '官网定价' : 'Official Pricing',
      description: isZh
        ? '直接从官方渠道购买，条款最清晰，信息最可追溯。'
        : 'Purchase directly from official channels. Clearest terms and most traceable.',
      recommendation: isZh ? '推荐作为基准参考' : 'Recommended as baseline',
      href: officialUrl,
      primary: true,
    },
    ...(authorizedUrl
      ? [
          {
            id: 'authorized',
            title: isZh ? '授权渠道' : 'Authorized Reseller',
            description: isZh
              ? '适合需要开票、本地付款或走采购流程的场景。'
              : 'Suitable for invoicing, local payment, or procurement processes.',
            recommendation: isZh ? '适合企业采购' : 'Good for enterprise procurement',
            href: authorizedUrl,
            primary: false,
          },
        ]
      : []),
    ...(affiliateUrl
      ? [
          {
            id: 'affiliate',
            title: isZh ? '购买入口（推广）' : 'Purchase Link (Affiliate)',
            description: isZh
              ? '可能包含推广标识，价格与条款以平台展示为准。'
              : 'May include affiliate tracking. Refer to platform for terms.',
            recommendation: isZh ? '便捷入口' : 'Convenient entry',
            href: affiliateUrl,
            primary: false,
          },
        ]
      : []),
  ];

  return (
    <SectionCard
      id={id}
      title={isZh ? '购买渠道' : 'Purchase Options'}
      description={isZh ? '选择适合你的购买方式' : 'Choose the purchase method that suits you'}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className={`rounded-xl border p-5 ${
              channel.primary
                ? 'border-primary/40 bg-primary/5'
                : 'border-border/70 bg-card'
            }`}
          >
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">{channel.title}</h4>
              {channel.primary && (
                <Badge variant="primary" size="sm">
                  {isZh ? '推荐' : 'Recommended'}
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{channel.description}</p>
            <p className="mt-2 text-xs text-muted-foreground/80">{channel.recommendation}</p>
            <a
              href={channel.href}
              target="_blank"
              rel="noreferrer noopener"
              className={`mt-4 inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors ${
                channel.primary
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {isZh ? '前往' : 'Go'} ↗
            </a>
          </div>
        ))}
      </div>

      {/* 企业采购提示 */}
      {(tool.pricing.hasEnterprise || tool.pricing.supportsContract) && (
        <div className="mt-4 rounded-xl border border-border/70 bg-muted/30 p-4">
          <h4 className="font-semibold text-foreground">
            {isZh ? '企业采购' : 'Enterprise Procurement'}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {isZh
              ? '如需 SLA、审计、合规等企业级要求，建议直接联系官方销售团队获取定制方案。'
              : 'For SLA, audit, compliance, or other enterprise requirements, contact the official sales team for custom solutions.'}
          </p>
          <a
            href={officialUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {isZh ? '联系销售' : 'Contact Sales'} ↗
          </a>
        </div>
      )}
    </SectionCard>
  );
}

/**
 * 合规信息卡片
 */
function ComplianceCard({ id, tool, language }: { id?: string; tool: IToolFrontmatter; language: TLanguage }) {
  const isZh = language !== 'en';

  return (
    <SectionCard
      id={id}
      title={isZh ? '合规信息' : 'Compliance'}
      description={isZh ? '发票、合同等采购合规支持' : 'Invoice, contract, and procurement compliance'}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 发票支持 */}
        <div className="rounded-xl border border-border/70 bg-card p-4 text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isZh ? '发票' : 'Invoice'}
          </div>
          <div className="mt-2">
            {tool.pricing.supportsInvoice ? (
              <Badge variant="success">{isZh ? '支持' : 'Yes'}</Badge>
            ) : (
              <Badge variant="secondary">{isZh ? '不支持' : 'No'}</Badge>
            )}
          </div>
        </div>

        {/* 合同支持 */}
        <div className="rounded-xl border border-border/70 bg-card p-4 text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isZh ? '合同' : 'Contract'}
          </div>
          <div className="mt-2">
            {tool.pricing.supportsContract ? (
              <Badge variant="success">{isZh ? '支持' : 'Yes'}</Badge>
            ) : (
              <Badge variant="secondary">{isZh ? '不支持' : 'No'}</Badge>
            )}
          </div>
        </div>

        {/* 企业版 */}
        <div className="rounded-xl border border-border/70 bg-card p-4 text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isZh ? '企业版' : 'Enterprise'}
          </div>
          <div className="mt-2">
            {tool.pricing.hasEnterprise ? (
              <Badge variant="success">{isZh ? '有' : 'Yes'}</Badge>
            ) : (
              <Badge variant="secondary">{isZh ? '无' : 'No'}</Badge>
            )}
          </div>
        </div>

        {/* 数据处理 */}
        <div className="rounded-xl border border-border/70 bg-card p-4 text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isZh ? '数据处理' : 'Data Processing'}
          </div>
          <div className="mt-2">
            <Badge variant={tool.privacy.localProcessing ? 'success' : 'secondary'}>
              {tool.privacy.localProcessing ? (isZh ? '本地' : 'Local') : (isZh ? '云端' : 'Cloud')}
            </Badge>
          </div>
        </div>
      </div>

      {/* 企业合规认证 */}
      {tool.privacy.enterpriseCompliance.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-foreground">
            {isZh ? '企业合规认证' : 'Enterprise Compliance'}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tool.privacy.enterpriseCompliance.map((item) => (
              <Badge key={item} className="bg-muted">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 隐私政策链接 */}
      {tool.privacy.policyUrl && (
        <div className="mt-4">
          <a
            href={tool.privacy.policyUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm text-primary hover:underline"
          >
            {isZh ? '查看隐私政策 ↗' : 'View Privacy Policy ↗'}
          </a>
        </div>
      )}
    </SectionCard>
  );
}

/**
 * 如何选择卡片
 */
function HowToChooseCard({ id, tool, language }: { id?: string; tool: IToolFrontmatter; language: TLanguage }) {
  const isZh = language !== 'en';
  const displayTitle = getToolDisplayTitle(tool, language);

  const scenarios = [
    {
      title: isZh ? '个人开发者' : 'Individual Developer',
      description: isZh
        ? '如果你是个人开发者，建议从官网直接购买，享受最清晰的条款和最直接的支持。'
        : 'For individual developers, purchase directly from the official website for clearest terms and direct support.',
      recommendation: isZh
        ? tool.pricing.free
          ? '可以先试用免费层，再决定是否升级'
          : '建议从官网购买'
        : tool.pricing.free
          ? 'Try the free tier first, then decide on upgrading'
          : 'Purchase from official website',
    },
    {
      title: isZh ? '小团队' : 'Small Team',
      description: isZh
        ? '小团队可以考虑团队版或按席位购买，注意是否需要开票。'
        : 'Small teams can consider team plans or per-seat pricing. Check if invoicing is needed.',
      recommendation: isZh
        ? tool.pricing.supportsInvoice
          ? '支持开票，可走正常采购流程'
          : '不支持开票，建议个人账户购买'
        : tool.pricing.supportsInvoice
          ? 'Invoicing supported, can use normal procurement'
          : 'No invoicing, consider individual accounts',
    },
    {
      title: isZh ? '企业采购' : 'Enterprise',
      description: isZh
        ? '企业采购通常需要合同、SLA、审计等要求，建议联系官方销售。'
        : 'Enterprise procurement typically requires contracts, SLA, audits. Contact official sales.',
      recommendation: isZh
        ? tool.pricing.hasEnterprise
          ? '有企业版，建议联系销售获取定制方案'
          : '无企业版，可能需要评估是否满足合规要求'
        : tool.pricing.hasEnterprise
          ? 'Enterprise version available, contact sales for custom plans'
          : 'No enterprise version, evaluate compliance requirements',
    },
  ];

  return (
    <SectionCard
      id={id}
      title={isZh ? '如何选择' : 'How to Choose'}
      description={isZh ? `根据你的场景选择 ${displayTitle} 的购买方式` : `Choose how to purchase ${displayTitle} based on your scenario`}
    >
      <div className="space-y-4">
        {scenarios.map((scenario) => (
          <div key={scenario.title} className="rounded-xl border border-border/70 bg-card p-4">
            <h4 className="font-semibold text-foreground">{scenario.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{scenario.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" size="sm">
                {isZh ? '建议' : 'Tip'}
              </Badge>
              <span className="text-sm text-foreground">{scenario.recommendation}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 更新时间 */}
      <div className="mt-4 text-xs text-muted-foreground">
        {isZh ? '购买信息更新：' : 'Purchase info updated: '}
        {formatDate(tool.purchase?.updatedAt ?? tool.updatedAt, language)}
      </div>
    </SectionCard>
  );
}

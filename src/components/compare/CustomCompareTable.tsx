'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { IToolFrontmatter, TLanguage } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { getToolDisplayTitle } from '@/lib/toolDisplay';
import { getPricingModelLabel, getToolCapabilityLabel } from '@/i18n/labels';
import { getRoleLabel, isRoleId } from '@/i18n/roles';

type TToolCompareItem = {
  slug: string;
  frontmatter: IToolFrontmatter;
};

interface ICustomCompareTableProps {
  language: TLanguage;
  tools: TToolCompareItem[];
}

/**
 * 自选对比表：面向“快速决策”，只对齐关键事实字段。
 */
export function CustomCompareTable({ language, tools }: ICustomCompareTableProps) {
  const isZh = language !== 'en';

  const rows: { label: string; render: (tool: IToolFrontmatter) => ReactNode }[] = [
    {
      label: isZh ? '上手成本' : 'Onboarding',
      render: (tool) => <span className="text-sm text-foreground">{tool.onboardingTime}</span>,
    },
    {
      label: isZh ? '价格模式' : 'Pricing',
      render: (tool) => (
        <div className="space-y-1">
          <div className="text-sm text-foreground">{getPricingModelLabel(language, tool.pricing.model)}</div>
          <div className="text-xs text-muted-foreground">
            {isZh ? '起步价' : 'Starting'}: {tool.pricing.startingPrice} {tool.pricing.currency} /{' '}
            {tool.pricing.billingCycle === 'monthly'
              ? isZh
                ? '月'
                : 'mo'
              : tool.pricing.billingCycle === 'yearly'
                ? isZh
                  ? '年'
                  : 'yr'
                : isZh
                  ? '用量'
                  : 'usage'}
          </div>
          <div className="text-xs text-muted-foreground">
            {isZh ? (tool.pricing.free ? '含免费方案' : '无免费方案') : tool.pricing.free ? 'Free tier' : 'No free tier'}
            {(tool.pricing.hasTeam || tool.pricing.hasEnterprise) && (
              <>
                {' '}
                · {tool.pricing.hasTeam ? (isZh ? '团队' : 'Team') : null}
                {tool.pricing.hasTeam && tool.pricing.hasEnterprise ? ' / ' : null}
                {tool.pricing.hasEnterprise ? (isZh ? '企业' : 'Enterprise') : null}
              </>
            )}
          </div>
          {(tool.pricing.supportsInvoice || tool.pricing.supportsContract) && (
            <div className="text-xs text-muted-foreground">
              {isZh ? '采购' : 'Procurement'}:{' '}
              {tool.pricing.supportsInvoice ? (isZh ? '发票' : 'Invoice') : null}
              {tool.pricing.supportsInvoice && tool.pricing.supportsContract ? ' / ' : null}
              {tool.pricing.supportsContract ? (isZh ? '合同' : 'Contract') : null}
            </div>
          )}
        </div>
      ),
    },
    {
      label: isZh ? '能力' : 'Capabilities',
      render: (tool) => (
        <div className="flex flex-wrap gap-1.5">
          {tool.capabilities.map((cap) => (
            <Badge key={cap}>{getToolCapabilityLabel(language, cap)}</Badge>
          ))}
        </div>
      ),
    },
    {
      label: isZh ? '适合角色' : 'Best for',
      render: (tool) => (
        <div className="flex flex-wrap gap-1.5">
          {tool.targetUsers.slice(0, 6).map((item) => (
            <Badge key={item}>
              {isRoleId(item) ? getRoleLabel(language, item) ?? item : item}
            </Badge>
          ))}
          {tool.targetUsers.length > 6 && <span className="text-xs text-muted-foreground">+{tool.targetUsers.length - 6}</span>}
        </div>
      ),
    },
    {
      label: isZh ? '隐私/合规' : 'Privacy & compliance',
      render: (tool) => (
        <div className="space-y-1">
          <div className="text-sm text-foreground">
            {isZh ? '本地处理' : 'Local'}:{' '}
            <span className={cn(tool.privacy.localProcessing ? 'text-foreground' : 'text-muted-foreground')}>
              {isZh ? (tool.privacy.localProcessing ? '支持' : '不支持/未知') : tool.privacy.localProcessing ? 'Yes' : 'No/unknown'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {isZh ? '数据保留' : 'Retention'}: {tool.privacy.dataRetention || '—'}
          </div>
          {tool.privacy.enterpriseCompliance.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tool.privacy.enterpriseCompliance.slice(0, 6).map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
              {tool.privacy.enterpriseCompliance.length > 6 && (
                <span className="text-xs text-muted-foreground">+{tool.privacy.enterpriseCompliance.length - 6}</span>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">{isZh ? '合规信息：—' : 'Compliance: —'}</div>
          )}
        </div>
      ),
    },
    {
      label: isZh ? '外部系统' : 'External systems',
      render: (tool) => {
        const systems = tool.externalSystemIntegrations?.map((s) => s.name) ?? tool.externalSystems ?? [];
        if (systems.length === 0) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {systems.slice(0, 8).map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
            {systems.length > 8 && <span className="text-xs text-muted-foreground">+{systems.length - 8}</span>}
          </div>
        );
      },
    },
    {
      label: isZh ? '更新时间' : 'Updated',
      render: (tool) => <span className="text-sm text-muted-foreground">{formatDate(tool.updatedAt, language)}</span>,
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl bg-background ring-1 ring-border/35">
      <table className="min-w-[860px] w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 w-[180px] border-b border-border/50 bg-background px-4 py-4 text-left text-xs font-semibold text-muted-foreground"
            >
              {isZh ? '维度' : 'Dimension'}
            </th>
            {tools.map((tool) => (
              <th
                key={tool.slug}
                scope="col"
                className="border-b border-border/50 bg-background px-4 py-4 text-left"
              >
                <div className="min-w-[220px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">{getToolDisplayTitle(tool.frontmatter, language)}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{tool.frontmatter.description}</div>
                    </div>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="shrink-0 rounded-full border border-input bg-background px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {isZh ? '查看' : 'Open'}
                    </Link>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="align-top">
              <th
                scope="row"
                className="sticky left-0 z-10 border-b border-border/40 bg-background px-4 py-4 text-left text-xs font-semibold text-foreground/80"
              >
                {row.label}
              </th>
              {tools.map((tool) => (
                <td key={`${row.label}-${tool.slug}`} className="border-b border-border/40 px-4 py-4">
                  {row.render(tool.frontmatter)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

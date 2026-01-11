import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ContentCard } from '@/components/content/ContentCard';
import { Badge } from '@/components/ui/Badge';
import { FilterChips } from '@/components/ui/FilterChips';
import { PageTabs } from '@/components/ui/PageTabs';
import { getAllCompares } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import { getAllTools } from '@/lib/content';
import { buildSearchHref, getStringParam } from '@/utils/query';
import { t } from '@/i18n/messages';
import { getRequestLanguage, tServer } from '@/i18n/server';
import { getToolDisplayTitle } from '@/lib/toolDisplay';

export function generateMetadata(): Metadata {
  const language = getRequestLanguage();
  return {
    title: t(language, 'compare.page.title'),
    description: t(language, 'compare.page.desc'),
  };
}

export default function ComparePage({ searchParams }: { searchParams?: { tool?: string | string[] } }) {
  const language = getRequestLanguage();
  const compares = getAllCompares();
  const toolParam = getStringParam(searchParams?.tool);
  const tools = getAllTools();

  const filtered = compares.filter((item) => {
    if (!toolParam) return true;
    return item.frontmatter.toolA.slug === toolParam || item.frontmatter.toolB.slug === toolParam;
  });

  return (
    <div>
      <PageHeader
        title={tServer('compare.page.title')}
        description={tServer('compare.page.desc')}
        align="center"
        density="compact"
        headline="description"
      />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <PageTabs
            items={[
              { label: tServer('tools.page.title'), href: '/tools', active: false },
              { label: tServer('compare.page.title'), href: '/compare', active: true },
            ]}
          />
          <div className="text-sm text-muted-foreground">
            {tServer('compare.page.hint.before')}{' '}
            <Link href="/tools" className="text-primary hover:underline">
              {tServer('tools.page.title')}
            </Link>
            {tServer('compare.page.hint.after')}
          </div>
          <FilterChips
            label={tServer('compare.filters.tool')}
            options={[
              { label: tServer('common.all'), href: buildSearchHref('/compare', {}), active: !toolParam },
              ...tools.map((tool) => ({
                label: getToolDisplayTitle(tool.frontmatter, language),
                href: buildSearchHref('/compare', { tool: tool.slug }),
                active: toolParam === tool.slug,
              })),
            ]}
          />
          <div className="text-sm text-muted-foreground">{tServer('common.results', { count: filtered.length })}</div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title={tServer('compare.empty.title')} description={tServer('compare.empty.desc')} />
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <ContentCard
                key={item.slug}
                href={`/compare/${item.slug}`}
                title={item.frontmatter.title}
                description={item.frontmatter.description}
                badges={<Badge>{item.frontmatter.toolA.name} vs {item.frontmatter.toolB.name}</Badge>}
                meta={tServer('compare.meta', {
                  date: formatDate(item.frontmatter.updatedAt, language),
                  versionPart: item.frontmatter.version ? tServer('compare.meta.versionPart', { version: item.frontmatter.version }) : '',
                })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageTabs } from '@/components/ui/PageTabs';
import { CustomCompareTable } from '@/components/compare/CustomCompareTable';
import { getAllTools } from '@/lib/content';
import { getStringArrayParam } from '@/utils/query';
import { getRequestLanguage, tServer } from '@/i18n/server';
import { t } from '@/i18n/messages';

export function generateMetadata(): Metadata {
  const language = getRequestLanguage();
  return {
    title: t(language, 'compare.custom.title'),
    description: t(language, 'compare.page.desc'),
  };
}

function uniqPreserveOrder(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

export default function CompareCustomPage({ searchParams }: { searchParams?: { tools?: string | string[] } }) {
  const language = getRequestLanguage();
  const isZh = language !== 'en';

  const toolSlugs = uniqPreserveOrder(getStringArrayParam(searchParams?.tools));
  const allTools = getAllTools();

  const selected = toolSlugs
    .map((slug) => allTools.find((tool) => tool.slug === slug))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="sr-only">{tServer('compare.custom.title')}</h1>

        <div className="space-y-4">
          <PageTabs
            items={[
              { label: tServer('tools.page.title'), href: '/tools', active: false },
              { label: tServer('compare.custom.title'), href: '/compare/custom', active: true },
              { label: tServer('compare.page.title'), href: '/compare', active: false },
            ]}
          />

          <div className="flex flex-col gap-3 rounded-2xl bg-muted/10 p-4 ring-1 ring-border/35 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">{tServer('compare.custom.title')}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {isZh ? '从产品列表选择多个产品后，在这里快速对齐关键事实。' : 'Select multiple products in Products, then align key facts here.'}
              </div>
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-full border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {isZh ? '去产品列表选择' : 'Select products'}
            </Link>
          </div>
        </div>

        {selected.length < 2 ? (
          <div className="mt-6">
            <EmptyState
              title={isZh ? '至少选择 2 个产品进行对比' : 'Select at least 2 products'}
              description={isZh ? '回到产品列表，选择多个产品后再进入自选对比。' : 'Go back to Products and select multiple tools.'}
              actionLabel={isZh ? '去产品列表' : 'Go to Products'}
              actionHref="/tools"
            />
          </div>
        ) : (
          <div className="mt-6">
            <CustomCompareTable
              language={language}
              tools={selected.map((tool) => ({ slug: tool.slug, frontmatter: tool.frontmatter }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}


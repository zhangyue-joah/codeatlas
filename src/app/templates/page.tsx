import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { PageShell } from '@/components/layout/PageShell';
import { getAllTemplates } from '@/lib/content';
import type { ITemplateFrontmatter } from '@/types';
import { getStringArrayParam, getStringParam, getPositiveIntParam, buildSearchHref } from '@/utils/query';
import { getRequestLanguage } from '@/i18n/server';
import { t } from '@/i18n/messages';
import { getTemplateTypeLabel } from '@/i18n/labels';
import { TemplatesListView } from '@/components/templates/TemplatesListView';
import { TEMPLATE_TYPES, isTemplateType } from '@/config/filterConfig';

const PAGE_SIZE = 12;

function uniqSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function matchesQuery(frontmatter: ITemplateFrontmatter, query: string) {
  const q = normalizeQuery(query);
  if (!q) return true;
  const haystack = [
    frontmatter.title,
    frontmatter.description,
    frontmatter.type,
    frontmatter.template,
    frontmatter.example,
    ...(frontmatter.applicableTools ?? []),
    ...(frontmatter.scenarios ?? []),
    ...(frontmatter.placeholders ?? []),
    ...(frontmatter.dependencies ?? []),
    ...(frontmatter.notes ?? []),
    ...(frontmatter.keywords ?? []),
  ]
    .join('\n')
    .toLowerCase();

  return haystack.includes(q);
}

export function generateMetadata(): Metadata {
  const language = getRequestLanguage();
  return {
    title: t(language, 'templates.page.title'),
    description: t(language, 'templates.page.desc'),
    robots: { index: false, follow: true },
  };
}

export default function TemplatesPage({
  searchParams,
}: {
  searchParams?: { type?: string | string[]; tools?: string | string[]; q?: string | string[]; page?: string | string[] };
}) {
  const language = getRequestLanguage();
  const templates = getAllTemplates();

  if (templates.length === 0) {
    return (
      <PageShell
        header={
          <PageHeader
            title={t(language, 'templates.page.title')}
            description={t(language, 'templates.page.desc')}
            align="center"
            density="minimal"
            headline="title"
          />
        }
      >
        <EmptyState title={t(language, 'templates.empty.title')} description={t(language, 'templates.empty.desc')} />
      </PageShell>
    );
  }

  const typeParam = getStringParam(searchParams?.type);
  const toolsParam = getStringArrayParam(searchParams?.tools);
  const query = getStringParam(searchParams?.q)?.trim() ?? '';

  const type = typeParam && isTemplateType(typeParam) ? typeParam : undefined;
  const toolOptions = uniqSorted(templates.flatMap((item) => item.frontmatter.applicableTools ?? []));
  const tools = toolsParam.filter((tool) => toolOptions.includes(tool));

  const filtered = templates.filter((item) => {
    if (type && item.frontmatter.type !== type) return false;
    if (tools.length > 0 && !tools.some((tool) => item.frontmatter.applicableTools.includes(tool))) return false;
    if (!matchesQuery(item.frontmatter, query)) return false;
    return true;
  });

  // 排序：精选优先，然后按更新时间
  const sorted = filtered.slice().sort((a, b) => {
    const aFeatured = a.frontmatter.featured ? 1 : 0;
    const bFeatured = b.frontmatter.featured ? 1 : 0;
    if (aFeatured !== bFeatured) return bFeatured - aFeatured;
    return b.frontmatter.updatedAt.localeCompare(a.frontmatter.updatedAt);
  });

  const resultCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const currentPage = Math.min(getPositiveIntParam(searchParams?.page), totalPages);
  const pagedItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const typeOptions = TEMPLATE_TYPES.map((key) => ({ value: key, label: getTemplateTypeLabel(language, key) }));

  return (
    <PageShell
      header={
        <PageHeader
          title={t(language, 'templates.page.title')}
          description={t(language, 'templates.page.desc')}
          align="center"
          density="minimal"
          headline="title"
        />
      }
    >
      <div className="space-y-6">
        {resultCount === 0 ? (
          <EmptyState
            title={language === 'en' ? 'No templates found' : '暂无匹配模板'}
            description={language === 'en' ? 'Try clearing filters or searching with different keywords.' : '尝试清空筛选项，或换个关键词。'}
            actionLabel={language === 'en' ? 'Reset filters' : '重置筛选'}
            actionHref="/templates"
          />
        ) : (
          <>
            <TemplatesListView
              language={language}
              tools={tools}
              type={type}
              query={query}
              typeOptions={typeOptions}
              toolOptions={toolOptions.map((value) => ({ value, label: value }))}
              totalCount={templates.length}
              resultCount={resultCount}
              items={pagedItems.map((item) => ({ slug: item.slug, frontmatter: item.frontmatter }))}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              labels={{ previous: t(language, 'common.prev'), next: t(language, 'common.next') }}
              buildHref={(page) =>
                buildSearchHref('/templates', {
                  type,
                  tools: tools.length > 0 ? tools : undefined,
                  q: query || undefined,
                  page: page > 1 ? String(page) : undefined,
                })
              }
            />
          </>
        )}
      </div>
    </PageShell>
  );
}

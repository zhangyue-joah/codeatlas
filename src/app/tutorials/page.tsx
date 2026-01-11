import Link from 'next/link';
import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { SectionCard } from '@/components/ui/SectionCard';
import { PageShell } from '@/components/layout/PageShell';
import { getAllTools, getAllTutorials } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import { buildSearchHref, getPositiveIntParam, getStringArrayParam, getStringParam } from '@/utils/query';
import { getRequestLanguage, tServer } from '@/i18n/server';
import { t } from '@/i18n/messages';
import type { TDifficulty, TTutorialType } from '@/types';
import { getTutorialDifficultyLabel, getTutorialTypeEntries, getTutorialTypeLabel } from '@/i18n/labels';
import { getTutorialTaskEntries, matchesTutorialTask } from '@/i18n/tasks';
import { TutorialsListView } from '@/components/tutorials/TutorialsListView';
import { getToolWeChatHeatScore } from '@/config/toolWeChatHeat';

const PAGE_SIZE = 12;

const TUTORIAL_TYPE_PRIORITY: TTutorialType[] = [
  'getting-started',
  'how-to',
  'automation',
  'quality-control',
  'team-practice',
];

const TUTORIAL_DIFFICULTY_PRIORITY: TDifficulty[] = ['beginner', 'intermediate', 'advanced'];

const TUTORIAL_SORT_OPTIONS = ['hot', 'latest', 'recommended'] as const;
type TTutorialSort = (typeof TUTORIAL_SORT_OPTIONS)[number];
const DEFAULT_SORT: TTutorialSort = 'hot';

function getTutorialTypePriority(type: TTutorialType): number {
  const index = TUTORIAL_TYPE_PRIORITY.indexOf(type);
  return index >= 0 ? index : Number.POSITIVE_INFINITY;
}

function getTutorialDifficultyPriority(difficulty: TDifficulty): number {
  const index = TUTORIAL_DIFFICULTY_PRIORITY.indexOf(difficulty);
  return index >= 0 ? index : Number.POSITIVE_INFINITY;
}

function isTutorialType(value: string): value is TTutorialType {
  return getTutorialTypeEntries('zh').some(([key]) => key === value);
}

function isTutorialSort(value: string): value is TTutorialSort {
  return (TUTORIAL_SORT_OPTIONS as readonly string[]).includes(value);
}

function getTutorialWeChatHeat(relatedTools: string[]): number {
  if (relatedTools.length === 0) return 0;
  let score = 0;
  for (const slug of relatedTools) {
    score = Math.max(score, getToolWeChatHeatScore(slug));
  }
  return score;
}

export function generateMetadata(): Metadata {
  const language = getRequestLanguage();
  return {
    title: t(language, 'tutorials.page.title'),
    description: t(language, 'tutorials.page.desc'),
  };
}

export default function TutorialsPage({
  searchParams,
}: {
  searchParams?: {
    tools?: string | string[];
    task?: string | string[];
    type?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  };
}) {
  const language = getRequestLanguage();
  const tutorials = getAllTutorials();
  const tools = getAllTools();

  const toolSlugSet = new Set(tools.map((item) => item.slug));
  const selectedTools = getStringArrayParam(searchParams?.tools).filter((slug) => toolSlugSet.has(slug));
  const task = getStringParam(searchParams?.task);
  const typeParam = getStringParam(searchParams?.type);
  const type = typeParam && isTutorialType(typeParam) ? typeParam : undefined;
  const sortParam = getStringParam(searchParams?.sort);
  const sort: TTutorialSort = sortParam && isTutorialSort(sortParam) ? sortParam : DEFAULT_SORT;

  const filtered = tutorials.filter((item) => {
    if (selectedTools.length > 0) {
      const related = item.frontmatter.relatedTools ?? [];
      if (related.length > 0 && !selectedTools.some((slug) => related.includes(slug))) return false;
    }
    if (task && !matchesTutorialTask(item.frontmatter.keywords, task)) return false;
    if (type && item.frontmatter.type !== type) return false;
    return true;
  });

  const taskOptions = getTutorialTaskEntries(language).map(([key, label]) => ({ value: key, label }));
  const toolOptions = tools
    .slice()
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title))
    .map((item) => ({ value: item.slug, label: item.frontmatter.title }));
  const typeOptions = getTutorialTypeEntries(language).map(([key, label]) => ({ value: key, label }));
  const sortOptions = [
    { value: 'latest', label: language === 'en' ? 'Latest' : '最新' },
    { value: 'hot', label: language === 'en' ? 'Hot (WeChat)' : '热度（公众号）' },
    { value: 'recommended', label: language === 'en' ? 'Recommended' : '推荐（结构化）' },
  ];

  const sorted = filtered
    .slice()
    .sort((a, b) => {
      const aFeatured = a.frontmatter.featured ? 1 : 0;
      const bFeatured = b.frontmatter.featured ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;

      // Featured items stay "newest first" to mimic公众号置顶/精选的更新策略。
      if (aFeatured === 1 && bFeatured === 1) {
        const date = b.frontmatter.updatedAt.localeCompare(a.frontmatter.updatedAt);
        if (date !== 0) return date;
        return a.frontmatter.title.localeCompare(b.frontmatter.title);
      }

      if (sort === 'latest') {
        const date = b.frontmatter.updatedAt.localeCompare(a.frontmatter.updatedAt);
        if (date !== 0) return date;
        return a.frontmatter.title.localeCompare(b.frontmatter.title);
      }

      if (sort === 'hot') {
        const heatDiff =
          getTutorialWeChatHeat(b.frontmatter.relatedTools) - getTutorialWeChatHeat(a.frontmatter.relatedTools);
        if (heatDiff !== 0) return heatDiff;
        const date = b.frontmatter.updatedAt.localeCompare(a.frontmatter.updatedAt);
        if (date !== 0) return date;
        return a.frontmatter.title.localeCompare(b.frontmatter.title);
      }

      // Recommended: group by type & difficulty for a more readable list.
      const typeDiff = getTutorialTypePriority(a.frontmatter.type) - getTutorialTypePriority(b.frontmatter.type);
      if (typeDiff !== 0) return typeDiff;
      const difficultyDiff =
        getTutorialDifficultyPriority(a.frontmatter.difficulty) - getTutorialDifficultyPriority(b.frontmatter.difficulty);
      if (difficultyDiff !== 0) return difficultyDiff;
      const date = b.frontmatter.updatedAt.localeCompare(a.frontmatter.updatedAt);
      if (date !== 0) return date;
      return a.frontmatter.title.localeCompare(b.frontmatter.title);
    });

  const resultCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const currentPage = Math.min(getPositiveIntParam(searchParams?.page), totalPages);
  const pagedItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const sortQuery = sort === DEFAULT_SORT ? undefined : sort;

  return (
    <PageShell
      header={
        <PageHeader
          title={tServer('tutorials.page.title')}
          description={tServer('tutorials.page.desc')}
          align="center"
          density="minimal"
          headline="title"
        />
      }
    >
      <div className="space-y-6">
        {resultCount === 0 ? (
          <EmptyState title={tServer('tutorials.empty.title')} description={tServer('tutorials.empty.desc')} />
        ) : (
          <>
            <TutorialsListView
              language={language}
              tools={selectedTools}
              task={task}
              type={type}
              sort={sort}
              toolOptions={toolOptions}
              taskOptions={taskOptions}
              typeOptions={typeOptions}
              sortOptions={sortOptions}
              totalCount={tutorials.length}
              resultCount={resultCount}
              items={pagedItems.map((item) => ({ slug: item.slug, frontmatter: item.frontmatter }))}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              labels={{ previous: tServer('common.prev'), next: tServer('common.next') }}
              buildHref={(page) =>
                buildSearchHref('/tutorials', {
                  tools: selectedTools,
                  task,
                  type,
                  sort: sortQuery,
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

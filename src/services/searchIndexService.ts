import type { TContentType } from '@/types';
import { getAllCompares, getAllTemplates, getAllTools, getAllTutorials } from '@/services/contentService';

export interface ISearchIndexItem {
  type: TContentType;
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  updatedAt?: string;
  href: string;
}

/**
 * 生成全站搜索索引（轻量字段），用于 `/api/search-index`。
 */
export function buildSearchIndex(): { generatedAt: string; items: ISearchIndexItem[] } {
  const tools = buildToolsIndexItems();
  const compares = buildComparesIndexItems();
  const tutorials = buildTutorialsIndexItems();
  const templates = buildTemplatesIndexItems();

  return {
    generatedAt: new Date().toISOString(),
    items: [...tools, ...compares, ...tutorials, ...templates],
  };
}

function buildToolsIndexItems(): ISearchIndexItem[] {
  return getAllTools().map((item) => ({
    type: 'tools',
    slug: item.slug,
    title: item.frontmatter.title,
    description: item.frontmatter.description,
    keywords: item.frontmatter.keywords,
    updatedAt: item.frontmatter.updatedAt,
    href: `/tools/${item.slug}`,
  }));
}

function buildComparesIndexItems(): ISearchIndexItem[] {
  return getAllCompares().map((item) => ({
    type: 'compare',
    slug: item.slug,
    title: item.frontmatter.title,
    description: item.frontmatter.description,
    keywords: item.frontmatter.keywords,
    updatedAt: item.frontmatter.updatedAt,
    href: `/compare/${item.slug}`,
  }));
}

function buildTutorialsIndexItems(): ISearchIndexItem[] {
  return getAllTutorials().map((item) => ({
    type: 'tutorials',
    slug: item.slug,
    title: item.frontmatter.title,
    description: item.frontmatter.description,
    keywords: item.frontmatter.keywords,
    updatedAt: item.frontmatter.updatedAt,
    href: `/tutorials/${item.slug}`,
  }));
}

function buildTemplatesIndexItems(): ISearchIndexItem[] {
  return getAllTemplates().map((item) => ({
    type: 'templates',
    slug: item.slug,
    title: item.frontmatter.title,
    description: item.frontmatter.description,
    keywords: item.frontmatter.keywords,
    updatedAt: item.frontmatter.updatedAt,
    href: `/templates/${item.slug}`,
  }));
}

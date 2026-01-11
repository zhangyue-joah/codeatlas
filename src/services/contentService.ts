import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';
import type { ICompareFrontmatter, ITemplateFrontmatter, ITutorialFrontmatter, IToolFrontmatter, TContentType } from '@/types';
import {
  assertCompareFrontmatter,
  assertTemplateFrontmatter,
  assertToolFrontmatter,
  assertTutorialFrontmatter,
} from '@/services/frontmatterValidation';
import { getToolGithubAppearanceScore } from '@/config/toolPopularity';
import { getToolWeChatHeatScore } from '@/config/toolWeChatHeat';

const CONTENT_DIRECTORY = path.join(process.cwd(), 'src/content');
const SAFE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isSafeSlug(slug: string): boolean {
  return SAFE_SLUG_REGEX.test(slug);
}

function normalizeFrontmatter(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeFrontmatter(item));
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(record)) {
      normalized[key] = normalizeFrontmatter(item);
    }
    return normalized;
  }
  return value;
}

function normalizeToolFrontmatter(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  const record = data as Record<string, unknown>;
  const pricing = record.pricing;
  if (!pricing || typeof pricing !== 'object') return data;
  const pricingRecord = pricing as Record<string, unknown>;
  const startingPrice = pricingRecord.startingPrice;
  if (typeof startingPrice === 'number' && Number.isFinite(startingPrice)) {
    pricingRecord.startingPrice = String(startingPrice);
  }
  return data;
}

/**
 * 获取指定类型的所有内容文件（仅 `.mdx`）。
 */
export function getContentFiles(type: TContentType): string[] {
  const dir = path.join(CONTENT_DIRECTORY, type);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => file.endsWith('.mdx'));
}

/**
 * 获取所有 slugs（从文件名推导）。
 */
export function getAllSlugs(type: TContentType): string[] {
  return getContentFiles(type).map((file) => file.replace(/\.mdx$/, ''));
}

/**
 * 根据 slug 读取内容（带 frontmatter）。
 *
 * 安全说明：slug 必须匹配安全正则，避免目录穿越。
 */
export function getContentBySlug<TFrontmatter>(
  type: TContentType,
  slug: string
): { frontmatter: TFrontmatter; content: string } | null {
  if (!isSafeSlug(slug)) return null;

  const filePath = path.join(CONTENT_DIRECTORY, type, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  const normalized = normalizeFrontmatter(data);
  const frontmatter = (type === 'tools' ? normalizeToolFrontmatter(normalized) : normalized) as TFrontmatter;

  return {
    frontmatter,
    content,
  };
}

/**
 * 获取所有内容（带 frontmatter + slug）。
 */
export function getAllContent<TFrontmatter>(
  type: TContentType
): { frontmatter: TFrontmatter; content: string; slug: string }[] {
  const slugs = getAllSlugs(type);

  return slugs
    .map((slug) => {
      const data = getContentBySlug<TFrontmatter>(type, slug);
      if (!data) return null;
      return { ...data, slug };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function sortByUpdatedAtDesc<T extends { frontmatter: { updatedAt?: string } }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.frontmatter.updatedAt ? Date.parse(a.frontmatter.updatedAt) : 0;
    const bTime = b.frontmatter.updatedAt ? Date.parse(b.frontmatter.updatedAt) : 0;
    return bTime - aTime;
  });
}

function sortToolsDefault<T extends { slug: string; frontmatter: { updatedAt?: string; title: string } }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const wechatDiff = getToolWeChatHeatScore(b.slug) - getToolWeChatHeatScore(a.slug);
    if (wechatDiff !== 0) return wechatDiff;
    const scoreDiff = getToolGithubAppearanceScore(b.slug) - getToolGithubAppearanceScore(a.slug);
    if (scoreDiff !== 0) return scoreDiff;
    const aTime = a.frontmatter.updatedAt ? Date.parse(a.frontmatter.updatedAt) : 0;
    const bTime = b.frontmatter.updatedAt ? Date.parse(b.frontmatter.updatedAt) : 0;
    if (aTime !== bTime) return bTime - aTime;
    return a.frontmatter.title.localeCompare(b.frontmatter.title);
  });
}

/**
 * 获取所有工具（带校验与缓存）。
 */
export const getAllTools = cache(() => {
  const items = getAllContent<IToolFrontmatter>('tools');
  for (const item of items) assertToolFrontmatter(item.frontmatter, item.slug);
  return sortToolsDefault(items);
});

/**
 * 获取所有对比（带校验与缓存）。
 */
export const getAllCompares = cache(() => {
  const items = getAllContent<ICompareFrontmatter>('compare');
  for (const item of items) assertCompareFrontmatter(item.frontmatter, item.slug);
  return sortByUpdatedAtDesc(items);
});

/**
 * 获取所有教程（带校验与缓存）。
 */
export const getAllTutorials = cache(() => {
  const items = getAllContent<ITutorialFrontmatter>('tutorials');
  for (const item of items) assertTutorialFrontmatter(item.frontmatter, item.slug);
  return sortByUpdatedAtDesc(items);
});

/**
 * 获取所有模板（带校验与缓存）。
 */
export const getAllTemplates = cache(() => {
  const items = getAllContent<ITemplateFrontmatter>('templates');
  for (const item of items) assertTemplateFrontmatter(item.frontmatter, item.slug);
  return sortByUpdatedAtDesc(items);
});

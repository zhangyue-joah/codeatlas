import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getAllCompares, getAllTemplates, getAllTools, getAllTutorials } from '@/lib/content';

function toLastModified(updatedAt?: string): Date | undefined {
  if (!updatedAt) return undefined;
  const time = Date.parse(updatedAt);
  if (Number.isNaN(time)) return undefined;
  return new Date(time);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/tools`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/compare`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/tutorials`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/templates`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/use`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/buy`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const tools = getAllTools().map((item) => ({
    url: `${baseUrl}/tools/${item.slug}`,
    lastModified: toLastModified(item.frontmatter.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const compares = getAllCompares().map((item) => ({
    url: `${baseUrl}/compare/${item.slug}`,
    lastModified: toLastModified(item.frontmatter.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const tutorials = getAllTutorials().map((item) => ({
    url: `${baseUrl}/tutorials/${item.slug}`,
    lastModified: toLastModified(item.frontmatter.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const templates = getAllTemplates().map((item) => ({
    url: `${baseUrl}/templates/${item.slug}`,
    lastModified: toLastModified(item.frontmatter.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.2,
  }));

  return [...staticRoutes, ...tools, ...compares, ...tutorials, ...templates];
}

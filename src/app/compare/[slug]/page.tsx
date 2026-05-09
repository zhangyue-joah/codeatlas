import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CompareDetailView } from '@/components/compare/CompareDetailView';
import { getContentBySlug } from '@/services/contentService';
import { assertCompareFrontmatter } from '@/services/frontmatterValidation';
import type { ICompareFrontmatter } from '@/types';
import { getRequestLanguage } from '@/i18n/server';

export const dynamic = 'force-dynamic';

function getCompareOrThrow(slug: string) {
  const data = getContentBySlug<ICompareFrontmatter>('compare', slug);
  if (!data) notFound();
  assertCompareFrontmatter(data.frontmatter, slug);
  return data;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const language = getRequestLanguage();
  const data = getContentBySlug<ICompareFrontmatter>('compare', params.slug);
  if (!data) return { title: language === 'en' ? 'Comparison not found' : '对比未找到' };
  const frontmatter = data.frontmatter;
  const title = frontmatter.seoTitle ?? frontmatter.title;
  const description = frontmatter.seoDescription ?? frontmatter.description;

  return {
    title,
    description,
    keywords: frontmatter.keywords,
    alternates: {
      canonical: `/compare/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/compare/${params.slug}`,
    },
  };
}

export default function CompareDetailPage({ params }: { params: { slug: string } }) {
  const { frontmatter, content } = getCompareOrThrow(params.slug);
  return <CompareDetailView compare={frontmatter} content={content} />;
}

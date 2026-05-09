import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/services/contentService';
import { assertToolFrontmatter } from '@/services/frontmatterValidation';
import type { IToolFrontmatter } from '@/types';
import { ToolDetailView } from '@/components/tools/ToolDetailView';
import { getRequestLanguage } from '@/i18n/server';
import { getToolDisplayTitle } from '@/lib/toolDisplay';

export const dynamic = 'force-dynamic';

function getToolOrThrow(slug: string) {
  const data = getContentBySlug<IToolFrontmatter>('tools', slug);
  if (!data) notFound();
  assertToolFrontmatter(data.frontmatter, slug);
  return data;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const language = getRequestLanguage();
  const data = getContentBySlug<IToolFrontmatter>('tools', params.slug);
  if (!data) return { title: language === 'en' ? 'Product not found' : '工具未找到' };
  const frontmatter = data.frontmatter;
  const title = frontmatter.seoTitle ?? getToolDisplayTitle(frontmatter, language);
  const description = frontmatter.seoDescription ?? frontmatter.description;

  return {
    title,
    description,
    keywords: frontmatter.keywords,
    alternates: {
      canonical: `/tools/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/tools/${params.slug}`,
    },
  };
}

export default function ToolDetailPage({ params }: { params: { slug: string } }) {
  const { frontmatter, content } = getToolOrThrow(params.slug);
  return <ToolDetailView tool={frontmatter} content={content} />;
}

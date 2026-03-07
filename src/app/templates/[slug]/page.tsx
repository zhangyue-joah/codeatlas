import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TemplateDetailView } from '@/components/templates/TemplateDetailView';
import { getContentBySlug } from '@/services/contentService';
import { assertTemplateFrontmatter } from '@/services/frontmatterValidation';
import type { ITemplateFrontmatter } from '@/types';
import { getRequestLanguage } from '@/i18n/server';

export const dynamic = 'force-dynamic';

function getTemplateOrThrow(slug: string) {
  const data = getContentBySlug<ITemplateFrontmatter>('templates', slug);
  if (!data) notFound();
  assertTemplateFrontmatter(data.frontmatter, slug);
  return data;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const language = getRequestLanguage();
  const data = getContentBySlug<ITemplateFrontmatter>('templates', params.slug);
  if (!data) return { title: language === 'en' ? 'Template not found' : '模板未找到' };
  const frontmatter = data.frontmatter;
  const title = frontmatter.title;
  const description = frontmatter.description;

  return {
    title,
    description,
    keywords: frontmatter.keywords,
    alternates: {
      canonical: `/templates/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/templates/${params.slug}`,
    },
    robots: { index: false, follow: true },
  };
}

export default function TemplateDetailPage({ params }: { params: { slug: string } }) {
  const { frontmatter, content } = getTemplateOrThrow(params.slug);
  return <TemplateDetailView template={frontmatter} content={content} />;
}

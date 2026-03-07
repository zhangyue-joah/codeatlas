import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TutorialDetailView } from '@/components/tutorials/TutorialDetailView';
import { getContentBySlug } from '@/services/contentService';
import { assertTutorialFrontmatter } from '@/services/frontmatterValidation';
import type { ITutorialFrontmatter } from '@/types';
import { getRequestLanguage } from '@/i18n/server';

export const dynamic = 'force-dynamic';

function getTutorialOrThrow(slug: string) {
  const data = getContentBySlug<ITutorialFrontmatter>('tutorials', slug);
  if (!data) notFound();
  assertTutorialFrontmatter(data.frontmatter, slug);
  return data;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const language = getRequestLanguage();
  const data = getContentBySlug<ITutorialFrontmatter>('tutorials', params.slug);
  if (!data) return { title: language === 'en' ? 'Guide not found' : '教程未找到' };
  const frontmatter = data.frontmatter;
  const title = frontmatter.seoTitle ?? frontmatter.title;
  const description = frontmatter.seoDescription ?? frontmatter.description;

  return {
    title,
    description,
    keywords: frontmatter.keywords,
    alternates: {
      canonical: `/tutorials/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/tutorials/${params.slug}`,
    },
  };
}

export default function TutorialDetailPage({ params }: { params: { slug: string } }) {
  const { frontmatter, content } = getTutorialOrThrow(params.slug);
  return <TutorialDetailView tutorial={frontmatter} content={content} />;
}

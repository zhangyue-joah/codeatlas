import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/services/contentService';
import { assertToolFrontmatter } from '@/services/frontmatterValidation';
import type { IToolFrontmatter } from '@/types';
import { BuyDetailView } from '@/components/buy/BuyDetailView';
import { getRequestLanguage } from '@/i18n/server';
import { getToolDisplayTitle } from '@/lib/toolDisplay';
import { t } from '@/i18n/messages';

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
  const displayTitle = getToolDisplayTitle(frontmatter, language);
  const title = language === 'en'
    ? `Buy ${displayTitle} - Pricing & Purchase Guide`
    : `购买 ${displayTitle} - 定价与采购指南`;
  const description = language === 'en'
    ? `Pricing, purchase options, and procurement guide for ${displayTitle}. Compare official pricing, authorized resellers, and enterprise options.`
    : `${displayTitle} 的定价、购买渠道和采购指南。对比官网定价、授权渠道和企业采购选项。`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default function BuyDetailPage({ params }: { params: { slug: string } }) {
  const { frontmatter } = getToolOrThrow(params.slug);
  return <BuyDetailView slug={params.slug} tool={frontmatter} />;
}

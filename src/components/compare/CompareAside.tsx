import Link from 'next/link';
import type { ICompareFrontmatter } from '@/types';
import { getAllTools } from '@/lib/content';
import { SectionCard } from '@/components/ui/SectionCard';
import { t } from '@/i18n/messages';

export function CompareAside({ compare, language }: { compare: ICompareFrontmatter; language: 'zh' | 'en' }) {
  const toolSlugs = getAllTools().map((tool) => tool.slug);
  const toolAExists = toolSlugs.includes(compare.toolA.slug);
  const toolBExists = toolSlugs.includes(compare.toolB.slug);

  const toc = [
    { href: '#summary', label: t(language, 'compare.detail.aside.summary') },
    { href: '#conclusions', label: t(language, 'compare.detail.aside.conclusions') },
    { href: '#compare-table', label: t(language, 'compare.detail.aside.table') },
    ...(compare.scenarios.length > 0 ? [{ href: '#scenarios', label: t(language, 'compare.detail.aside.scenarios') }] : []),
    { href: '#cost-risk', label: t(language, 'compare.detail.aside.costRisk') },
    { href: '#risk-checklist', label: t(language, 'compare.detail.aside.risks') },
    { href: '#compliance-notes', label: t(language, 'compare.detail.aside.compliance') },
    { href: '#details', label: t(language, 'compare.detail.aside.details') },
  ];

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <SectionCard title={t(language, 'compare.detail.aside.toc')}>
        <ul className="space-y-2 text-sm">
          {toc.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="text-muted-foreground hover:text-foreground">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </SectionCard>

      {(toolAExists || toolBExists) && (
        <SectionCard title={t(language, 'compare.detail.aside.relatedTools')}>
          <div className="flex flex-col gap-2 text-sm">
            {toolAExists && (
              <Link href={`/tools/${compare.toolA.slug}`} className="text-primary hover:underline">
                {compare.toolA.name} →
              </Link>
            )}
            {toolBExists && (
              <Link href={`/tools/${compare.toolB.slug}`} className="text-primary hover:underline">
                {compare.toolB.name} →
              </Link>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}


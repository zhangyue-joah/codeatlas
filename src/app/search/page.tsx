import type { Metadata } from 'next';
import { SearchPageClient } from '@/components/search/SearchPageClient';
import { getStringParam } from '@/utils/query';
import type { TContentType } from '@/types';
import { getRequestLanguage, tServer } from '@/i18n/server';
import { t } from '@/i18n/messages';
import { PageHeader } from '@/components/ui/PageHeader';

export function generateMetadata(): Metadata {
  const language = getRequestLanguage();
  return {
    title: t(language, 'search.page.title'),
    description: t(language, 'search.page.desc'),
    robots: { index: false, follow: true },
  };
}

function isContentType(value: string): value is TContentType {
  return value === 'tools' || value === 'compare' || value === 'tutorials' || value === 'templates';
}

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[]; type?: string | string[] };
}) {
  const q = getStringParam(searchParams?.q) ?? '';
  const typeParam = getStringParam(searchParams?.type);
  const type = typeParam && isContentType(typeParam) ? typeParam : 'all';

  return (
    <div>
      <PageHeader
        title={tServer('search.page.title')}
        description={tServer('search.page.desc')}
        align="center"
        density="compact"
        headline="description"
      />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <SearchPageClient initialQuery={q} initialType={type} />
      </div>
    </div>
  );
}

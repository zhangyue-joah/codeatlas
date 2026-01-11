import type { ICompareFrontmatter } from '@/types';
import { MdxRenderer } from '@/components/mdx/MdxRenderer';
import { DetailLayout } from '@/components/layout/DetailLayout';
import { BackLink } from '@/components/ui/BackLink';
import { getRequestLanguage } from '@/i18n/server';
import { t } from '@/i18n/messages';
import { CompareAside } from '@/components/compare/CompareAside';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  CompareHeadline,
  ConclusionSection,
  CostSection,
  DimensionSection,
  ScenarioSection,
} from '@/components/compare/CompareDetailSections';

interface ICompareDetailViewProps {
  compare: ICompareFrontmatter;
  content: string;
}

export function CompareDetailView({ compare, content }: ICompareDetailViewProps) {
  const language = getRequestLanguage();
  return (
    <DetailLayout
      main={
        <div>
          <PageHeader
            variant="inline"
            title={compare.title}
            description={compare.description}
            updatedAt={compare.updatedAt}
            version={compare.version}
          />
          <div className="mt-8">
          <CompareHeadline compare={compare} language={language} />
          <ConclusionSection compare={compare} language={language} />
          <DimensionSection compare={compare} language={language} />
          <ScenarioSection compare={compare} language={language} />
          <CostSection compare={compare} language={language} />
          <div id="details" className="mt-10 scroll-mt-24 rounded-2xl border border-border/70 bg-card shadow-card">
            <MdxRenderer source={content} />
          </div>
          <div className="mt-8">
            <BackLink href="/compare" label={t(language, 'compare.detail.back')} />
          </div>
          </div>
        </div>
      }
      aside={<CompareAside compare={compare} language={language} />}
    />
  );
}

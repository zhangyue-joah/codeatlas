import Link from 'next/link';
import type { ICompareFrontmatter } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { SectionCard } from '@/components/ui/SectionCard';
import { getAllTools } from '@/lib/content';
import { cn } from '@/lib/utils';
import { REQUIRED_COMPARE_DIMENSIONS } from '@/config/compareDimensions';
import { t } from '@/i18n/messages';
import { getCompareDimensionLabel } from '@/i18n/compareDimensions';
import { CompareRiskSection } from '@/components/compare/CompareRiskSection';

export function CompareHeadline({ compare, language }: { compare: ICompareFrontmatter; language: 'zh' | 'en' }) {
  const toolSlugs = getAllTools().map((tool) => tool.slug);
  const toolAExists = toolSlugs.includes(compare.toolA.slug);
  const toolBExists = toolSlugs.includes(compare.toolB.slug);

  return (
    <SectionCard
      id="summary"
      title={t(language, 'compare.detail.summary.title')}
      description={t(language, 'compare.detail.summary.desc')}
      headerRight={
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {toolAExists && (
            <Link href={`/tools/${compare.toolA.slug}`} className="text-primary hover:underline">
              {t(language, 'compare.detail.summary.viewTool', { name: compare.toolA.name })}
            </Link>
          )}
          {toolBExists && (
            <Link href={`/tools/${compare.toolB.slug}`} className="text-primary hover:underline">
              {t(language, 'compare.detail.summary.viewTool', { name: compare.toolB.name })}
            </Link>
          )}
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{compare.toolA.name}</Badge>
        <span className="text-sm text-muted-foreground">vs</span>
        <Badge>{compare.toolB.name}</Badge>
      </div>
    </SectionCard>
  );
}

export function ConclusionSection({ compare, language }: { compare: ICompareFrontmatter; language: 'zh' | 'en' }) {
  return (
    <section id="conclusions" className="mt-10 scroll-mt-24">
      <h2 className="text-lg font-semibold text-foreground">{t(language, 'compare.detail.section.conclusions')}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <ConclusionCard
          title={t(language, 'compare.detail.conclusion.beginners')}
          compare={compare}
          recommendation={compare.conclusions.forBeginners.recommendation}
          reason={compare.conclusions.forBeginners.reason}
          language={language}
        />
        <ConclusionCard
          title={t(language, 'compare.detail.conclusion.professionals')}
          compare={compare}
          recommendation={compare.conclusions.forProfessionals.recommendation}
          reason={compare.conclusions.forProfessionals.reason}
          language={language}
        />
        <ConclusionCard
          title={t(language, 'compare.detail.conclusion.teams')}
          compare={compare}
          recommendation={compare.conclusions.forTeams.recommendation}
          reason={compare.conclusions.forTeams.reason}
          language={language}
        />
      </div>
    </section>
  );
}

function ConclusionCard({
  title,
  compare,
  recommendation,
  reason,
  language,
}: {
  title: string;
  compare: ICompareFrontmatter;
  recommendation: 'toolA' | 'toolB';
  reason: string;
  language: 'zh' | 'en';
}) {
  const recommendedName = recommendation === 'toolA' ? compare.toolA.name : compare.toolB.name;
  return (
    <SectionCard
      title={title}
      headerRight={<Badge>{t(language, 'compare.detail.conclusion.recommend', { name: recommendedName })}</Badge>}
    >
      <p className="text-sm text-muted-foreground">{reason}</p>
    </SectionCard>
  );
}

export function DimensionSection({ compare, language }: { compare: ICompareFrontmatter; language: 'zh' | 'en' }) {
  const orderedDimensions = sortCompareDimensions(compare.dimensions);

  return (
    <section id="compare-table" className="mt-10 scroll-mt-24">
      <h2 className="text-lg font-semibold text-foreground">{t(language, 'compare.detail.section.table')}</h2>
      <div className="mt-4 overflow-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-3 py-2 font-semibold text-foreground">{t(language, 'compare.detail.table.dimension')}</th>
              <th className="px-3 py-2 font-semibold text-foreground">{compare.toolA.name}</th>
              <th className="px-3 py-2 font-semibold text-foreground">{compare.toolB.name}</th>
            </tr>
          </thead>
          <tbody>
            {orderedDimensions.map((row) => (
              <tr key={row.dimension} className="border-b border-border">
                <td className="px-3 py-3 align-top font-medium text-foreground">
                  {getCompareDimensionLabel(language, row.dimension)}
                </td>
                <td className={cn('px-3 py-3 align-top', row.toolA.score > row.toolB.score && 'bg-primary/5')}>
                  <CompareScoreCell score={row.toolA.score} description={row.toolA.description} />
                </td>
                <td className={cn('px-3 py-3 align-top', row.toolB.score > row.toolA.score && 'bg-primary/5')}>
                  <CompareScoreCell score={row.toolB.score} description={row.toolB.description} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function sortCompareDimensions(dimensions: ICompareFrontmatter['dimensions']): ICompareFrontmatter['dimensions'] {
  const orderIndex = new Map<string, number>(REQUIRED_COMPARE_DIMENSIONS.map((item, index) => [item, index]));
  return [...dimensions].sort((a, b) => {
    const aIndex = orderIndex.get(a.dimension) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = orderIndex.get(b.dimension) ?? Number.MAX_SAFE_INTEGER;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.dimension.localeCompare(b.dimension, 'zh-Hans-CN');
  });
}

function CompareScoreCell({ score, description }: { score: number; description: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Badge className="bg-muted">{score}/10</Badge>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{description}</div>
    </div>
  );
}

export function ScenarioSection({ compare, language }: { compare: ICompareFrontmatter; language: 'zh' | 'en' }) {
  if (compare.scenarios.length === 0) return null;
  return (
    <section id="scenarios" className="mt-10 scroll-mt-24">
      <h2 className="text-lg font-semibold text-foreground">{t(language, 'compare.detail.section.scenarios')}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {compare.scenarios.map((scenario) => (
          <SectionCard
            key={scenario.scenario}
            title={scenario.scenario}
            headerRight={<Badge className="bg-muted">{renderWinnerLabel(language, compare, scenario.winner)}</Badge>}
          >
            <p className="text-sm text-muted-foreground">{scenario.description}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {t(language, 'compare.detail.scenario.reason', { reason: scenario.reason })}
            </p>
          </SectionCard>
        ))}
      </div>
    </section>
  );
}

function renderWinnerLabel(language: 'zh' | 'en', compare: ICompareFrontmatter, winner: 'toolA' | 'toolB' | 'tie'): string {
  if (winner === 'tie') return t(language, 'compare.detail.winner.tie');
  const name = winner === 'toolA' ? compare.toolA.name : compare.toolB.name;
  return t(language, 'compare.detail.winner.win', { name });
}

export function CostSection({ compare, language }: { compare: ICompareFrontmatter; language: 'zh' | 'en' }) {
  return (
    <section id="cost-risk" className="mt-10 scroll-mt-24">
      <h2 className="text-lg font-semibold text-foreground">{t(language, 'compare.detail.section.costRisk')}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <CostCard
          title={compare.toolA.name}
          monthlyIndividual={compare.costAnalysis.toolA.monthlyIndividual}
          monthlyTeam={compare.costAnalysis.toolA.monthlyTeam}
          hiddenCosts={compare.costAnalysis.toolA.hiddenCosts}
          language={language}
        />
        <CostCard
          title={compare.toolB.name}
          monthlyIndividual={compare.costAnalysis.toolB.monthlyIndividual}
          monthlyTeam={compare.costAnalysis.toolB.monthlyTeam}
          hiddenCosts={compare.costAnalysis.toolB.hiddenCosts}
          language={language}
        />
      </div>
      <CompareRiskSection compare={compare} language={language} />
      <p className="mt-4 text-sm text-muted-foreground">{compare.finalVerdict}</p>
    </section>
  );
}

function CostCard({
  title,
  monthlyIndividual,
  monthlyTeam,
  hiddenCosts,
  language,
}: {
  title: string;
  monthlyIndividual: string;
  monthlyTeam: string;
  hiddenCosts: string[];
  language: 'zh' | 'en';
}) {
  return (
    <SectionCard title={title}>
      <dl className="grid gap-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">{t(language, 'compare.detail.cost.individualPerMonth')}</dt>
          <dd className="text-foreground">{monthlyIndividual}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">{t(language, 'compare.detail.cost.teamPerMonth')}</dt>
          <dd className="text-foreground">{monthlyTeam}</dd>
        </div>
      </dl>
      {hiddenCosts.length > 0 && (
        <>
          <div className="mt-4 text-sm font-medium text-card-foreground">{t(language, 'compare.detail.cost.hiddenCosts')}</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {hiddenCosts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </SectionCard>
  );
}


import Link from 'next/link';
import type { ITutorialFrontmatter } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { MdxRenderer } from '@/components/mdx/MdxRenderer';
import { getAllTemplates, getAllTutorials } from '@/lib/content';
import { DetailLayout } from '@/components/layout/DetailLayout';
import { SectionCard } from '@/components/ui/SectionCard';
import { BackLink } from '@/components/ui/BackLink';
import { PageHeader } from '@/components/ui/PageHeader';
import { OnThisPageNav } from '@/components/ui/OnThisPageNav';
import { buildTemplateTitleIndex } from '@/utils/contentIndex';
import { SopSteps } from '@/components/tutorials/SopSteps';
import { TutorialSafetySection } from '@/components/tutorials/TutorialSafetySection';
import { getRequestLanguage } from '@/i18n/server';
import { t } from '@/i18n/messages';
import { getToolCapabilityLabel, getTutorialDifficultyLabel, getTutorialTypeLabel } from '@/i18n/labels';

interface ITutorialDetailViewProps {
  tutorial: ITutorialFrontmatter;
  content: string;
}

export function TutorialDetailView({ tutorial, content }: ITutorialDetailViewProps) {
  const language = getRequestLanguage();
  const hasCapabilities = Boolean(tutorial.requiredCapabilities && tutorial.requiredCapabilities.length > 0);
  const hasSopSteps = Boolean(tutorial.steps && tutorial.steps.length > 0);
  const hasSafety =
    (tutorial.safety?.checklist && tutorial.safety.checklist.length > 0) ||
    (tutorial.safety?.notes && tutorial.safety.notes.length > 0) ||
    (tutorial.safety?.sources && tutorial.safety.sources.length > 0);
  const hasAcceptance = tutorial.acceptanceCriteria.length > 0;
  const hasFailures = tutorial.commonFailures.length > 0;

  const tocItems = [
    { href: '#goal' as const, label: t(language, 'tutorial.detail.toc.goal') },
    { href: '#required-tools' as const, label: t(language, 'tutorial.detail.toc.requiredTools') },
    ...(hasCapabilities ? [{ href: '#required-capabilities' as const, label: t(language, 'tutorial.detail.toc.requiredCapabilities') }] : []),
    { href: '#steps-overview' as const, label: t(language, 'tutorial.detail.toc.stepsOverview') },
    ...(hasSopSteps ? [{ href: '#sop-steps' as const, label: t(language, 'tutorial.detail.toc.sopSteps') }] : []),
    ...(hasSafety ? [{ href: '#safety-checklist' as const, label: t(language, 'tutorial.detail.toc.safety') }] : []),
    { href: '#key-tips' as const, label: t(language, 'tutorial.detail.toc.keyTips') },
    ...(hasFailures ? [{ href: '#common-failures' as const, label: t(language, 'tutorial.detail.toc.failures') }] : []),
    ...(hasAcceptance ? [{ href: '#acceptance-criteria' as const, label: t(language, 'tutorial.detail.toc.acceptance') }] : []),
  ];

  const templates = getAllTemplates();
  const templateTitleIndex = buildTemplateTitleIndex(templates);
  const relatedTemplates = tutorial.relatedTemplates.filter((slug) => Boolean(templateTitleIndex[slug])).slice(0, 10);

  return (
    <DetailLayout
      asidePlacement="left"
      asideVariant="narrow"
      mainClassName="lg:pr-6 xl:pr-10"
      main={
        <div className="space-y-8">
          <PageHeader
            variant="inline"
            title={tutorial.title}
            description={tutorial.description}
            updatedAt={tutorial.updatedAt}
            version={tutorial.version}
          />
          <TutorialMeta tutorial={tutorial} language={language} />
          <TutorialSopSummary tutorial={tutorial} language={language} />
          {tutorial.steps && tutorial.steps.length > 0 && <SopSteps steps={tutorial.steps} />}
          <TutorialSafetySection tutorial={tutorial} />
          <div className="mt-10 rounded-2xl border border-border/70 bg-card shadow-card">
            <MdxRenderer source={content} />
          </div>
          <TutorialFailures tutorial={tutorial} language={language} />
          <TutorialAcceptance tutorial={tutorial} language={language} />
          <TutorialPrevNext tutorial={tutorial} language={language} />
        </div>
      }
      aside={
        <div className="space-y-6 lg:sticky lg:top-24">
          <BackLink href="/tutorials" label={t(language, 'tutorial.detail.back')} />
          <OnThisPageNav title={t(language, 'tutorial.detail.aside.toc')} items={tocItems} showTitle={false} />
          {relatedTemplates.length > 0 ? (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t(language, 'tutorial.detail.aside.relatedTemplates')}
              </div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                {relatedTemplates.map((slug) => (
                  <Link key={slug} href={`/templates/${slug}`} className="text-primary hover:underline">
                    {templateTitleIndex[slug] ?? slug}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      }
    />
  );
}

function TutorialMeta({ tutorial, language }: { tutorial: ITutorialFrontmatter; language: 'zh' | 'en' }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>{getTutorialTypeLabel(language, tutorial.type)}</Badge>
      <Badge className="bg-muted">{getTutorialDifficultyLabel(language, tutorial.difficulty)}</Badge>
      <Badge className="bg-muted">{t(language, 'tutorial.detail.eta', { time: tutorial.estimatedTime })}</Badge>
    </div>
  );
}

function TutorialSopSummary({ tutorial, language }: { tutorial: ITutorialFrontmatter; language: 'zh' | 'en' }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TutorialListCard id="goal" title={t(language, 'tutorial.detail.section.goal')} items={[tutorial.goal]} />
      <TutorialListCard id="required-tools" title={t(language, 'tutorial.detail.section.requiredTools')} items={tutorial.requiredTools} />
      <TutorialCapabilitiesCard tutorial={tutorial} language={language} />
      <TutorialListCard id="steps-overview" title={t(language, 'tutorial.detail.section.stepsOverview')} items={tutorial.stepsOverview} />
      <TutorialListCard id="key-tips" title={t(language, 'tutorial.detail.section.keyTips')} items={tutorial.keyTips} />
    </div>
  );
}

/**
 * 教程页“适用能力”区块：补齐 PRD 的“适用工具 & 能力”要求，避免只写在正文里导致不可见/不可检索。
 */
function TutorialCapabilitiesCard({ tutorial, language }: { tutorial: ITutorialFrontmatter; language: 'zh' | 'en' }) {
  if (!tutorial.requiredCapabilities || tutorial.requiredCapabilities.length === 0) return null;

  return (
    <SectionCard id="required-capabilities" title={t(language, 'tutorial.detail.section.requiredCapabilities')}>
      <div className="flex flex-wrap gap-2">
        {tutorial.requiredCapabilities.map((capability) => (
          <Badge key={capability} className="bg-muted">
            {getToolCapabilityLabel(language, capability) ?? capability}
          </Badge>
        ))}
      </div>
    </SectionCard>
  );
}

function TutorialAcceptance({ tutorial, language }: { tutorial: ITutorialFrontmatter; language: 'zh' | 'en' }) {
  if (tutorial.acceptanceCriteria.length === 0) return null;
  return (
    <SectionCard id="acceptance-criteria" className="mt-10" title={t(language, 'tutorial.detail.section.acceptance')}>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {tutorial.acceptanceCriteria.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </SectionCard>
  );
}

function TutorialListCard({ id, title, items }: { id?: string; title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <SectionCard id={id} title={title}>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </SectionCard>
  );
}

function TutorialFailures({ tutorial, language }: { tutorial: ITutorialFrontmatter; language: 'zh' | 'en' }) {
  if (tutorial.commonFailures.length === 0) return null;
  return (
    <SectionCard id="common-failures" className="mt-10" title={t(language, 'tutorial.detail.section.failures')}>
      <div className="space-y-3">
        {tutorial.commonFailures.map((item) => (
          <div key={item.problem} className="rounded-lg border border-border bg-muted px-3 py-2">
            <div className="text-sm font-medium text-foreground">
              {t(language, 'tutorial.detail.failure.problem', { problem: item.problem })}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {t(language, 'tutorial.detail.failure.solution', { solution: item.solution })}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function TutorialPrevNext({ tutorial, language }: { tutorial: ITutorialFrontmatter; language: 'zh' | 'en' }) {
  const tutorialSlugs = getAllTutorials().map((t) => t.slug);
  const prev = tutorial.prevTutorial && tutorialSlugs.includes(tutorial.prevTutorial) ? tutorial.prevTutorial : undefined;
  const next = tutorial.nextTutorial && tutorialSlugs.includes(tutorial.nextTutorial) ? tutorial.nextTutorial : undefined;
  if (!prev && !next) return null;

  return (
    <div id="prev-next" className="mt-10 grid scroll-mt-24 gap-4 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/tutorials/${prev}`}
          className="rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <div className="text-xs text-muted-foreground">{t(language, 'tutorial.detail.prev')}</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{prev}</div>
        </Link>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card opacity-50">
          <div className="text-xs text-muted-foreground">{t(language, 'tutorial.detail.prev')}</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{t(language, 'tutorial.detail.none')}</div>
        </div>
      )}

      {next ? (
        <Link
          href={`/tutorials/${next}`}
          className="rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <div className="text-xs text-muted-foreground">{t(language, 'tutorial.detail.next')}</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{next}</div>
        </Link>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card opacity-50">
          <div className="text-xs text-muted-foreground">{t(language, 'tutorial.detail.next')}</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{t(language, 'tutorial.detail.none')}</div>
        </div>
      )}
    </div>
  );
}

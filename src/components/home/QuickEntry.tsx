import Link from 'next/link';
import { getRequestLanguage, tServer } from '@/i18n/server';
import { getTutorialTaskEntries } from '@/i18n/tasks';
import { getTemplateTypeEntries, getToolCategoryEntries } from '@/i18n/labels';
import { AI_CODING_WORKFLOWS, TEMPLATE_TYPES } from '@/config/filterConfig';

export function QuickEntry() {
  const language = getRequestLanguage();

  const tasks = getTutorialTaskEntries(language).map(([id, label]) => ({ id, label, href: `/tutorials?task=${id}` }));
  const workflows = getToolCategoryEntries(language)
    .filter(([key]) => AI_CODING_WORKFLOWS.includes(key))
    .map(([id, label]) => ({ id, label, href: `/tools?workflow=${id}` }));

  const templateTypeLabelMap = new Map(getTemplateTypeEntries(language));
  const templates = TEMPLATE_TYPES.map((id) => ({
    id,
    label: templateTypeLabelMap.get(id) ?? id,
    href: `/templates?type=${id}`,
  }));

  const buys = getBuyQuickEntries(language);

  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-muted/15 p-6 ring-1 ring-border/40 sm:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance font-display text-xl font-medium tracking-tight text-foreground sm:text-2xl">
              {tServer('home.quickEntry.title')}
            </h2>
            <p className="mt-2 text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
              {tServer('home.quickEntry.desc')}
            </p>
          </div>

          {/* 新手推荐卡片 */}
          <div className="mt-6">
            <Link
              href="/use"
              className="group flex items-center justify-between rounded-2xl bg-primary/10 px-5 py-4 ring-1 ring-primary/20 transition-all hover:bg-primary/15 hover:ring-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tServer('home.quickEntry.newbie.title')}</p>
                  <p className="text-xs text-muted-foreground">{tServer('home.quickEntry.newbie.desc')}</p>
                </div>
              </div>
              <svg className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8">
            <QuickEntryBlock title={tServer('home.quickEntry.task')} items={tasks} />
            <QuickEntryBlock title={tServer('home.quickEntry.tools')} items={workflows} />
            <QuickEntryBlock title={tServer('home.quickEntry.templates')} items={templates} />
            <QuickEntryBlock title={tServer('home.quickEntry.buy')} items={buys} />
          </div>
        </div>
      </div>
    </section>
  );
}

// AI_CODING_WORKFLOWS 和 TEMPLATE_TYPES 从 @/config/filterConfig 导入

function getBuyQuickEntries(language: 'zh' | 'en'): { id: string; label: string; href: string }[] {
  const isZh = language !== 'en';
  return [
    { id: 'invoice', label: isZh ? '可开票' : 'Invoice', href: '/buy?compliance=invoice' },
    { id: 'contract', label: isZh ? '支持合同' : 'Contract', href: '/buy?compliance=contract' },
    { id: 'enterprise', label: isZh ? '企业采购' : 'Enterprise', href: '/buy?procurement=enterprise' },
    { id: 'free', label: isZh ? '免费层' : 'Free tier', href: '/buy?pricing=free' },
  ];
}

function QuickEntryBlock({
  title,
  items,
}: {
  title: string;
  items: { id: string; label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
        {items.map((item) => (
          <ChipLink key={item.id} href={item.href} label={item.label} />
        ))}
      </div>
    </div>
  );
}

function ChipLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground ring-1 ring-border/40 transition-colors hover:bg-background hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="max-w-[14rem] truncate whitespace-nowrap">{label}</span>
    </Link>
  );
}

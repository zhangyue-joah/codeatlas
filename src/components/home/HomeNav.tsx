import Link from 'next/link';
import { tServer } from '@/i18n/server';
import { cn } from '@/lib/utils';

type THomeWhatCard = {
  title: string;
  summary: string;
  highlights: [string, string];
  href: string;
  icon: React.ReactNode;
  accentColor: string;
};

/** 卡片图标配置 */
const CARD_ICONS = {
  tools: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
    </svg>
  ),
  tutorials: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  templates: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  ),
  buy: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  ),
};

/** 卡片强调色配置 */
const CARD_ACCENTS = {
  tools: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  tutorials: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  templates: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  buy: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

/**
 * 首页导航区（新用户）：先说清楚"这里有什么"，再给出"怎么开始"。
 */
export function HomeNav() {
  const whatCards: THomeWhatCard[] = [
    {
      title: tServer('nav.products'),
      summary: tServer('home.cards.tools.summary'),
      highlights: [tServer('home.cards.tools.p1'), tServer('home.cards.tools.p2')],
      href: '/tools',
      icon: CARD_ICONS.tools,
      accentColor: CARD_ACCENTS.tools,
    },
    {
      title: tServer('nav.tutorials'),
      summary: tServer('home.cards.tutorials.summary'),
      highlights: [tServer('home.cards.tutorials.p1'), tServer('home.cards.tutorials.p2')],
      href: '/tutorials',
      icon: CARD_ICONS.tutorials,
      accentColor: CARD_ACCENTS.tutorials,
    },
    {
      title: tServer('nav.rules'),
      summary: tServer('home.cards.templates.summary'),
      highlights: [tServer('home.cards.templates.p1'), tServer('home.cards.templates.p2')],
      href: '/templates',
      icon: CARD_ICONS.templates,
      accentColor: CARD_ACCENTS.templates,
    },
    {
      title: tServer('nav.buy'),
      summary: tServer('home.cards.buy.summary'),
      highlights: [tServer('home.cards.buy.p1'), tServer('home.cards.buy.p2')],
      href: '/buy',
      icon: CARD_ICONS.buy,
      accentColor: CARD_ACCENTS.buy,
    },
  ];

  return (
    <section className="pb-12 pt-2 sm:pb-14 sm:pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">{tServer('home.what.title')}</h2>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:gap-8">
          {whatCards.map((card) => (
            <HomeWhatCard
              key={card.href}
              title={card.title}
              summary={card.summary}
              highlights={card.highlights}
              href={card.href}
              icon={card.icon}
              accentColor={card.accentColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeWhatCard({
  title,
  summary,
  highlights,
  href,
  icon,
  accentColor,
}: {
  title: string;
  summary: string;
  highlights: [string, string];
  href: string;
  icon: React.ReactNode;
  accentColor: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative block h-full rounded-3xl bg-background p-8 ring-1 ring-border/60 transition-all sm:p-10',
        'hover:bg-muted/30 hover:shadow-lg hover:ring-border hover:-translate-y-1',
        'active:bg-muted/40',
        'focus-visible:bg-muted/30 focus-visible:shadow-lg focus-visible:ring-border focus-visible:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
      )}
    >
      {/* 图标徽章 */}
      <div className={cn('mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl', accentColor)}>
        {icon}
      </div>

      <div className="text-left">
        <h3 className="text-balance font-display text-xl font-medium tracking-[-0.02em] text-foreground sm:text-2xl">
          {title}
        </h3>
        <p className="mt-3 text-balance text-sm leading-6 text-foreground/70 sm:text-base">
          {summary}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-2 text-xs text-foreground/50 sm:text-sm">
          <span>{highlights[0]}</span>
          <span className="text-foreground/30" aria-hidden="true">
            ·
          </span>
          <span>{highlights[1]}</span>
        </div>
      </div>

      {/* 箭头指示器 - 始终可见但 hover 时增强 */}
      <span
        className={cn(
          'absolute right-6 top-1/2 -translate-y-1/2 text-foreground/40 transition-all',
          'group-hover:translate-x-1 group-hover:text-foreground/70',
          'group-focus-visible:translate-x-1 group-focus-visible:text-foreground/70',
          'sm:right-8'
        )}
        aria-hidden="true"
      >
        <ChevronRightIcon />
      </span>
    </Link>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

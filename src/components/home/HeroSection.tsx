import Link from 'next/link';
import { tServer } from '@/i18n/server';
import { getAllTools } from '@/lib/content';
import { getAllTutorials } from '@/lib/content';
import { getAllTemplates } from '@/lib/content';

/**
 * 首页首屏：价值主张 + 明确下一步（CTA）+ 数字统计。
 */
export function HeroSection() {
  // 获取内容统计数据
  const toolsCount = getAllTools().length || 10;
  const tutorialsCount = getAllTutorials().length || 50;
  const templatesCount = getAllTemplates().length || 20;

  return (
    <section className="relative overflow-hidden bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            {tServer('home.hero.slogan')}
          </h1>

          <p className="mt-4 text-balance text-sm leading-relaxed text-foreground/70 sm:text-base">
            {tServer('home.hero.subtitle')}
          </p>

          {/* CTA Buttons - 精简为 2 个 */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/use"
              className="inline-flex w-full max-w-xs items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto sm:text-base"
            >
              {tServer('home.hero.cta.start')}
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>

            <Link
              href="/tools"
              className="inline-flex w-full max-w-xs items-center justify-center rounded-full bg-background px-8 py-3 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-muted hover:ring-border/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto sm:text-base"
            >
              {tServer('home.hero.cta.products')}
            </Link>
          </div>

          {/* 数字统计 - 社会证明 */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>
              {tServer('home.hero.stats', {
                tools: toolsCount,
                tutorials: tutorialsCount,
                templates: templatesCount,
              })}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

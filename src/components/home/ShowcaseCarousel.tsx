'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/client';

export type TShowcaseTone = 'light' | 'dark';

export type TShowcaseItem = {
  href: string;
  title: string;
  description: string;
  meta?: string;
  tone?: TShowcaseTone;
};

interface IShowcaseCarouselProps {
  items: TShowcaseItem[];
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

/** 卡片装饰色配置 - 统一使用主题色，保持简洁 */
const CARD_ACCENT = {
  gradient: 'from-primary/5 to-primary/10',
  border: 'hover:border-primary/30',
  icon: 'text-primary',
};

/**
 * 首页精选教程展示：大屏网格布局 + 小屏轮播，带序号和渐变装饰。
 */
export function ShowcaseCarousel({
  items,
  title,
  description,
  actionHref,
  actionLabel,
}: IShowcaseCarouselProps) {
  const { t, language } = useT();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const canRender = items.length > 0;
  const normalized = useMemo(() => items.slice(0, 6), [items]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollLeft > 20) {
        setHasScrolled(true);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  if (!canRender) return null;

  const scrollByCardGroup = (direction: 'prev' | 'next') => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.max(280, Math.round(el.clientWidth * 0.9));
    el.scrollBy({ left: direction === 'prev' ? -delta : delta, behavior: 'smooth' });
  };

  const isZh = language !== 'en';

  return (
    <section className="bg-gradient-to-b from-muted/20 via-muted/30 to-muted/20 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description || (actionHref && actionLabel)) && (
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
            {title && (
              <h2 className="text-balance font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-3 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
                {description}
              </p>
            )}
            {actionHref && actionLabel && (
              <Link
                href={actionHref}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/10 hover:gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {actionLabel}
                <ArrowIcon direction="right" />
              </Link>
            )}
          </div>
        )}

        {/* 大屏：网格布局 */}
        <div className="mx-auto hidden max-w-6xl md:block">
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 lg:gap-6">
            {normalized.map((item, index) => (
              <ShowcaseCard key={item.href} item={item} index={index} />
            ))}
          </div>
        </div>

        {/* 小屏：轮播布局 */}
        <div className="relative md:hidden">
          <button
            type="button"
            onClick={() => scrollByCardGroup('prev')}
            aria-label={t('common.prev')}
            title={t('common.prev')}
            className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/95 shadow-lg ring-1 ring-border/30 backdrop-blur-sm transition-all hover:scale-105 hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:inline-flex"
          >
            <ArrowIcon direction="left" />
          </button>

          <button
            type="button"
            onClick={() => scrollByCardGroup('next')}
            aria-label={t('common.next')}
            title={t('common.next')}
            className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/95 shadow-lg ring-1 ring-border/30 backdrop-blur-sm transition-all hover:scale-105 hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:inline-flex"
          >
            <ArrowIcon direction="right" />
          </button>

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {normalized.map((item, index) => (
              <div key={item.href} className="w-[85vw] shrink-0 snap-center sm:w-[380px]">
                <ShowcaseCard item={item} index={index} />
              </div>
            ))}
          </div>

          {!hasScrolled && normalized.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <svg className="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              <span>{isZh ? '左右滑动查看更多' : 'Swipe to see more'}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({ item, index = 0 }: { item: TShowcaseItem; index?: number }) {
  const tone: TShowcaseTone = item.tone ?? 'light';

  return (
    <Link
      href={item.href}
      className={cn(
        'group relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl border bg-background p-5 transition-all duration-300 sm:min-h-[220px] sm:p-6',
        'hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        tone === 'dark'
          ? 'border-transparent bg-gradient-to-br from-zinc-900 to-zinc-700 text-zinc-50'
          : `border-border/50 ${CARD_ACCENT.border}`
      )}
    >
      {/* 渐变装饰背景 */}
      {tone !== 'dark' && (
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          CARD_ACCENT.gradient
        )} />
      )}

      {/* 序号徽章 */}
      <div className={cn(
        'relative mb-4 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-transform duration-300 group-hover:scale-110',
        tone === 'dark'
          ? 'bg-white/10 text-white'
          : `bg-primary/10 ${CARD_ACCENT.icon}`
      )}>
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="relative flex-1">
        <h3 className="text-balance font-display text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {item.title}
        </h3>
        <p
          className={cn(
            'mt-2.5 text-sm leading-relaxed line-clamp-3',
            tone === 'dark' ? 'text-zinc-200' : 'text-muted-foreground'
          )}
        >
          {item.description}
        </p>
      </div>

      {item.meta && (
        <div className={cn(
          'relative mt-4 flex items-center gap-2 border-t pt-4 text-xs',
          tone === 'dark' ? 'border-white/10 text-zinc-300' : 'border-border/50 text-muted-foreground'
        )}>
          <ClockIcon className="h-3.5 w-3.5" />
          <span>{item.meta}</span>
        </div>
      )}

      {/* 悬停箭头指示 */}
      <div className={cn(
        'absolute bottom-5 right-5 flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 sm:bottom-6 sm:right-6',
        tone === 'dark' ? 'bg-white/10' : 'bg-primary/10'
      )}>
        <ArrowIcon direction="right" />
      </div>
    </Link>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 4.5V8L10.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

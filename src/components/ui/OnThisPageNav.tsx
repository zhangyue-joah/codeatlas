'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export interface IOnThisPageItem {
  href: `#${string}`;
  label: string;
}

interface IOnThisPageNavProps {
  title: string;
  items: IOnThisPageItem[];
  showTitle?: boolean;
}

export function OnThisPageNav({ title, items, showTitle = true }: IOnThisPageNavProps) {
  const [activeHref, setActiveHref] = useState<string | null>(null);

  const hrefKey = useMemo(() => items.map((i) => i.href).join('|'), [items]);

  useEffect(() => {
    setActiveHref(typeof window !== 'undefined' ? window.location.hash || null : null);
    const onHashChange = () => setActiveHref(window.location.hash || null);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const ids = items
      .map((item) => item.href.slice(1))
      .map((id) => id.trim())
      .filter(Boolean);

    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        const topMost = visible[0]?.target as HTMLElement | undefined;
        if (topMost?.id) setActiveHref(`#${topMost.id}`);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.1, 0.25] }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [hrefKey, items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label={title} className="text-sm">
      {showTitle ? (
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      ) : null}
      <ul className={cn('space-y-1', showTitle ? 'mt-3' : 'mt-0')}>
        {items.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <li key={item.href}>
              <a
                className={cn(
                  'block border-l-2 py-1.5 pl-3 transition-colors',
                  isActive
                    ? 'border-primary font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
                href={item.href}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

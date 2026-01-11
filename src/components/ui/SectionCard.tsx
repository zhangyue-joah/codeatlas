import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ISectionCardProps {
  id?: string;
  title: string;
  description?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * 通用区块卡片：统一标题/描述/边框样式，用于详情页的各子模块。
 */
export function SectionCard({ id, title, description, headerRight, children, className }: ISectionCardProps) {
  return (
    <section
      id={id}
      className={cn(
        'rounded-2xl border border-border/70 bg-card p-6 shadow-card sm:p-7',
        id && 'scroll-mt-24',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {headerRight}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

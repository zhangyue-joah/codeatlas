import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IContentCardProps {
  href: string;
  title: string;
  description: string;
  meta?: ReactNode;
  badges?: ReactNode;
  className?: string;
}

export function ContentCard({ href, title, description, meta, badges, className }: IContentCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'block rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-card-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
        {badges && <div className="shrink-0">{badges}</div>}
      </div>
      {meta && <div className="mt-4 text-xs text-muted-foreground">{meta}</div>}
    </Link>
  );
}

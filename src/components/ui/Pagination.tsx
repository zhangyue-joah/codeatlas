import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TPaginationItem = number | 'ellipsis';

function getPaginationItems(currentPage: number, totalPages: number): TPaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}

function PaginationLink({
  href,
  disabled,
  active,
  ariaLabel,
  children,
}: {
  href?: string;
  disabled?: boolean;
  active?: boolean;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const className = cn(
    'inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    active
      ? 'bg-primary text-primary-foreground'
      : 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
    disabled ? 'pointer-events-none border-input/60 text-muted-foreground opacity-60' : null
  );

  if (!href || disabled || active) {
    return (
      <span className={className} aria-current={active ? 'page' : undefined} aria-disabled={disabled ? 'true' : undefined}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
  ariaLabel,
  className,
  labels,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
  ariaLabel?: string;
  className?: string;
  labels?: { previous: string; next: string };
}) {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(currentPage, totalPages);
  const previousLabel = labels?.previous ?? 'Prev';
  const nextLabel = labels?.next ?? 'Next';

  return (
    <nav aria-label={ariaLabel ?? 'Pagination'} className={cn('flex flex-wrap items-center justify-center gap-2 pt-8', className)}>
      <PaginationLink
        href={currentPage > 1 ? buildHref(currentPage - 1) : undefined}
        disabled={currentPage <= 1}
        ariaLabel="Previous page"
      >
        {previousLabel}
      </PaginationLink>

      {items.map((item, index) => {
        if (item === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="inline-flex h-9 items-center px-2 text-sm text-muted-foreground select-none">
              …
            </span>
          );
        }

        const page = item;
        return (
          <PaginationLink key={page} href={buildHref(page)} active={page === currentPage} ariaLabel={`Page ${page}`}>
            {page}
          </PaginationLink>
        );
      })}

      <PaginationLink
        href={currentPage < totalPages ? buildHref(currentPage + 1) : undefined}
        disabled={currentPage >= totalPages}
        ariaLabel="Next page"
      >
        {nextLabel}
      </PaginationLink>
    </nav>
  );
}

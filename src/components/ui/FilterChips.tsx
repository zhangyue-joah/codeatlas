import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface IFilterChipOption {
  label: string;
  href: string;
  active: boolean;
}

interface IFilterChipsProps {
  label: string;
  options: IFilterChipOption[];
  wrap?: boolean;
  className?: string;
}

export function FilterChips({ label, options, wrap = true, className }: IFilterChipsProps) {
  return (
    <div className={cn(wrap ? 'flex flex-wrap items-center gap-2' : 'flex shrink-0 flex-nowrap items-center gap-2', className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className={wrap ? 'flex flex-wrap items-center gap-2' : 'flex flex-nowrap items-center gap-2'}>
        {options.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            aria-current={option.active ? 'page' : undefined}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              option.active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span className="max-w-[14rem] truncate whitespace-nowrap">{option.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

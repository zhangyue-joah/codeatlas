import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IPageShellProps {
  header: ReactNode;
  children: ReactNode;
  containerClassName?: string;
  className?: string;
}

export function PageShell({ header, children, containerClassName, className }: IPageShellProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {header}
      <div className={cn('mx-auto w-full px-4 pb-10 pt-6 sm:px-6 lg:px-8', containerClassName)}>{children}</div>
    </div>
  );
}


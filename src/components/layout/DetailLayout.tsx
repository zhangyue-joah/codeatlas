import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IDetailLayoutProps {
  header?: ReactNode;
  main: ReactNode;
  aside?: ReactNode;
  asidePlacement?: 'left' | 'right';
  asideVariant?: 'default' | 'narrow';
  mainClassName?: string;
  asideClassName?: string;
  className?: string;
}

/**
 * 详情页通用布局：统一 max-width/留白；可选右侧栏用于“用/买/导航”等。
 */
export function DetailLayout({
  header,
  main,
  aside,
  asidePlacement = 'right',
  asideVariant = 'default',
  mainClassName,
  asideClassName,
  className,
}: IDetailLayoutProps) {
  const gridClassName =
    asideVariant === 'narrow'
      ? 'grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8'
      : 'grid gap-6 lg:grid-cols-3';

  const mainNode =
    asideVariant === 'narrow' ? (
      <div className={cn('min-w-0', mainClassName)}>{main}</div>
    ) : (
      <div className={cn('lg:col-span-2 min-w-0', mainClassName)}>{main}</div>
    );

  const asideNode = <aside className={cn('space-y-4', asideClassName)}>{aside}</aside>;

  return (
    <div className={cn('mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8', className)}>
      {header ? <div className="mb-6">{header}</div> : null}
      {aside ? (
        <div className={gridClassName}>
          {asidePlacement === 'left' ? (
            <>
              {asideNode}
              {mainNode}
            </>
          ) : (
            <>
              {mainNode}
              {asideNode}
            </>
          )}
        </div>
      ) : (
        <div>{main}</div>
      )}
    </div>
  );
}

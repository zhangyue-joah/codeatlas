import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface IPageTabItem {
  label: string;
  href: string;
  active: boolean;
}

interface IPageTabsProps {
  items: IPageTabItem[];
}

/**
 * 页面顶部“入口切换”Tab：用于把相关入口收敛到同一区域，减少顶部导航的认知负担。
 */
export function PageTabs({ items }: IPageTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? 'page' : undefined}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              item.active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span className="max-w-[14rem] truncate whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
